import { useEffect, useMemo, useRef, useState } from "react";

type MapNoticePoint = {
  id: string;
  title: string;
  address: string;
  status?: string;
  eventType?: "ANNOUNCE" | "RECEIVE" | "RESULT";
  eventPhaseLabel?: string;
  eventBadgeLabel?: string;
};

type Props = {
  points: MapNoticePoint[];
  selectedDateLabel: string;
  selectedPointId?: string;
  onSelectPoint?: (id: string) => void;
};

type ResolvedPoint = {
  point: MapNoticePoint;
  coords: any | null;
};

declare global {
  interface Window {
    kakao?: any;
  }
}

const DEFAULT_CENTER = { lat: 37.4563, lng: 126.7052 }; // 인천시청 근처
const SDK_ID = "kakao-map-sdk";

const MARKER_COLOR_BY_TYPE: Record<string, string> = {
  ANNOUNCE: "#2563eb",
  RECEIVE: "#ef4444",
  RESULT: "#f59e0b",
};

let sdkPromise: Promise<any> | null = null;

function loadKakaoSdk(appKey: string) {
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    if (existing) {
      const expectedSrc = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=services&appkey=${appKey}`;
      // 이전에 다른 키로 로드된 script가 남아있으면 교체해서 키 변경을 반영한다.
      if (existing.src !== expectedSrc) {
        existing.remove();
      } else {
        existing.addEventListener("load", () => resolve(window.kakao));
        existing.addEventListener("error", () => {
          sdkPromise = null;
          reject(new Error("카카오맵 SDK 로드 실패"));
        });
        return;
      }
    }

    const script = document.createElement("script");
    script.id = SDK_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=services&appkey=${appKey}`;
    script.onload = () => resolve(window.kakao);
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("카카오맵 SDK 로드 실패"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

function buildMarkerSvgDataUri(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <path d="M18 2C9.715 2 3 8.715 3 17c0 10.343 11.476 23.36 14.293 26.429a1 1 0 0 0 1.414 0C21.524 40.36 33 27.343 33 17 33 8.715 26.285 2 18 2z" fill="${color}"/>
      <circle cx="18" cy="17" r="7" fill="#ffffff"/>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getMarkerImage(kakao: any, eventType?: "ANNOUNCE" | "RECEIVE" | "RESULT") {
  const color = MARKER_COLOR_BY_TYPE[eventType ?? "ANNOUNCE"] ?? MARKER_COLOR_BY_TYPE.ANNOUNCE;
  const src = buildMarkerSvgDataUri(color);
  const size = new kakao.maps.Size(30, 40);
  const offset = new kakao.maps.Point(15, 40);
  return new kakao.maps.MarkerImage(src, size, { offset });
}

export default function KakaoMapPanel({
  points,
  selectedDateLabel,
  selectedPointId,
  onSelectPoint,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markerByIdRef = useRef<Map<string, any>>(new Map());
  const resolvedByIdRef = useRef<Map<string, ResolvedPoint>>(new Map());
  const infoWindowRef = useRef<any>(null);

  const [error, setError] = useState("");
  const [resolvedPoints, setResolvedPoints] = useState<ResolvedPoint[]>([]);

  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY as string | undefined;

  const dedupedPoints = useMemo(() => {
    // 동일 공고/주소 중복 마커 방지
    const seen = new Set<string>();
    return points.filter((p) => {
      const key = `${p.title}|${p.address}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [points]);

  const openInfoWindow = (point: MapNoticePoint, marker: any) => {
    const content = `
      <div style="padding:10px 12px;max-width:250px;font-size:12px;line-height:1.45;">
        <div style="font-weight:700;margin-bottom:4px;">${point.title}</div>
        <div style="color:#1e293b;margin-bottom:3px;">기준: ${point.eventPhaseLabel ?? "-"}</div>
        <div style="color:#334155;margin-bottom:3px;">${point.status ?? "-"}</div>
        <div style="color:#64748b;">${point.address}</div>
      </div>
    `;
    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

  useEffect(() => {
    let active = true;

    async function initMap() {
      if (!mapRef.current) return;
      if (!appKey) {
        setError("카카오맵 API 키가 없습니다. `.env.local`에 `VITE_KAKAO_MAP_APP_KEY`를 설정해 주세요.");
        return;
      }

      try {
        setError("");
        const kakao = await loadKakaoSdk(appKey);
        if (!active) return;

        await new Promise<void>((resolve) => kakao.maps.load(() => resolve()));
        if (!active) return;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new kakao.maps.Map(mapRef.current, {
            center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
            level: 7,
          });
          infoWindowRef.current = new kakao.maps.InfoWindow({ zIndex: 3 });
        }

        const map = mapInstanceRef.current;
        const geocoder = new kakao.maps.services.Geocoder();
        const places = new kakao.maps.services.Places();

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        markerByIdRef.current.clear();
        resolvedByIdRef.current.clear();

        if (dedupedPoints.length === 0) {
          setResolvedPoints([]);
          return;
        }

        const geocodeResults = await Promise.all(
          dedupedPoints.map(
            (point) =>
              new Promise<ResolvedPoint>((resolve) => {
                geocoder.addressSearch(point.address, (result: any[], status: string) => {
                  if (status === kakao.maps.services.Status.OK && result[0]) {
                    const coords = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
                    resolve({ point, coords });
                    return;
                  }

                  // 주소 변환 실패 시 공고명 키워드 검색으로 한 번 더 좌표를 시도한다.
                  places.keywordSearch(point.title, (placeResult: any[], placeStatus: string) => {
                    if (placeStatus === kakao.maps.services.Status.OK && placeResult[0]) {
                      const coords = new kakao.maps.LatLng(Number(placeResult[0].y), Number(placeResult[0].x));
                      resolve({ point, coords });
                      return;
                    }
                    resolve({ point, coords: null });
                  });
                });
              })
          )
        );

        if (!active) return;
        setResolvedPoints(geocodeResults);

        const bounds = new kakao.maps.LatLngBounds();
        let markerCount = 0;

        geocodeResults.forEach((resolved) => {
          const { point, coords } = resolved;
          resolvedByIdRef.current.set(point.id, resolved);
          if (!coords) return;

          markerCount += 1;
          const marker = new kakao.maps.Marker({
            map,
            position: coords,
            title: point.title,
            image: getMarkerImage(kakao, point.eventType),
          });

          markerByIdRef.current.set(point.id, marker);
          markersRef.current.push(marker);
          bounds.extend(coords);

          kakao.maps.event.addListener(marker, "click", () => {
            onSelectPoint?.(point.id);
            openInfoWindow(point, marker);
          });
        });

        if (markerCount > 0) {
          map.setBounds(bounds);
        }
      } catch (e) {
        if (!active) return;
        const message = e instanceof Error ? e.message : "카카오맵 로딩 중 오류가 발생했습니다.";
        setError(message);
      }
    }

    void initMap();
    return () => {
      active = false;
    };
  }, [appKey, dedupedPoints, onSelectPoint]);

  useEffect(() => {
    if (!selectedPointId) return;

    const marker = markerByIdRef.current.get(selectedPointId);
    const resolved = resolvedByIdRef.current.get(selectedPointId);
    const map = mapInstanceRef.current;

    if (!marker || !resolved?.coords || !map) return;

    // 리스트 선택과 지도 상태를 동기화: 선택 항목으로 pan + infoWindow 오픈
    map.panTo(resolved.coords);
    openInfoWindow(resolved.point, marker);
  }, [selectedPointId, resolvedPoints]);

  return (
    <div className="kakao-map-panel">
      <div className="kakao-map-title">{selectedDateLabel} 진행/예정 공고 지도</div>
      {error ? <div className="kakao-map-error">{error}</div> : null}
      <div className="kakao-map-shell">
        <div ref={mapRef} className="kakao-map-canvas" />
      </div>
      {!error && dedupedPoints.length === 0 ? (
        <div className="kakao-map-empty">선택한 날짜에 지도에 표시할 진행/예정 공고가 없습니다.</div>
      ) : null}
      {!error && dedupedPoints.length > 0 && resolvedPoints.every((x) => !x.coords) ? (
        <div className="kakao-map-empty">해당 항목의 위치를 찾지 못했습니다. 주소 데이터 확인이 필요합니다.</div>
      ) : null}
    </div>
  );
}
