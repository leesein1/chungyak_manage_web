import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchDetailItem } from "@/pages/search/types";

type Props = {
  selected?: SearchDetailItem;
};

declare global {
  interface Window {
    kakao?: any;
  }
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const SDK_ID = "kakao-map-sdk";

const MARKER_COLORS = {
  scheduled: "#2563eb",
  receiving: "#ef4444",
  closed: "#f59e0b",
};

let sdkPromise: Promise<any> | null = null;

function loadKakaoSdk(appKey: string) {
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    const expectedSrc = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=services&appkey=${appKey}`;

    if (existing) {
      if (existing.src !== expectedSrc) {
        existing.remove();
      } else {
        existing.addEventListener("load", () => resolve(window.kakao), { once: true });
        existing.addEventListener(
          "error",
          () => {
            sdkPromise = null;
            reject(new Error("카카오맵 SDK 로드 실패"));
          },
          { once: true },
        );
        return;
      }
    }

    const script = document.createElement("script");
    script.id = SDK_ID;
    script.async = true;
    script.src = expectedSrc;
    script.onload = () => resolve(window.kakao);
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("카카오맵 SDK 로드 실패"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markerColorByStatus(statusText: string) {
  if (statusText.includes("마감")) return MARKER_COLORS.closed;
  if (statusText.includes("중")) return MARKER_COLORS.receiving;
  if (statusText.includes("예정")) return MARKER_COLORS.scheduled;
  return MARKER_COLORS.scheduled;
}

function buildMarkerImage(kakao: any, color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <path d="M18 2C9.715 2 3 8.715 3 17c0 10.343 11.476 23.36 14.293 26.429a1 1 0 0 0 1.414 0C21.524 40.36 33 27.343 33 17 33 8.715 26.285 2 18 2z" fill="${color}"/>
      <circle cx="18" cy="17" r="7" fill="#ffffff"/>
    </svg>
  `.trim();
  const src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  const size = new kakao.maps.Size(30, 40);
  const offset = new kakao.maps.Point(15, 40);
  return new kakao.maps.MarkerImage(src, size, { offset });
}

function geocodeAddress(kakao: any, query: string) {
  return new Promise<any | null>((resolve) => {
    if (!query.trim()) {
      resolve(null);
      return;
    }

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(query, (result: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        resolve(new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x)));
        return;
      }
      resolve(null);
    });
  });
}

function findByKeyword(kakao: any, query: string) {
  return new Promise<any | null>((resolve) => {
    if (!query.trim()) {
      resolve(null);
      return;
    }

    const places = new kakao.maps.services.Places();
    places.keywordSearch(query, (result: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        resolve(new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x)));
        return;
      }
      resolve(null);
    });
  });
}

export default function DetailMap({ selected }: Props) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const [error, setError] = useState("");

  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY as string | undefined;
  const statusText = selected?.rawStatus || selected?.status || "";
  const markerColor = markerColorByStatus(statusText);

  const locationQueries = useMemo(() => {
    if (!selected) return [];
    return [selected.address, selected.region, `${selected.complex} ${selected.title}`]
      .map((v) => v.trim())
      .filter(Boolean);
  }, [selected]);

  useEffect(() => {
    let active = true;

    async function drawMap() {
      if (!selected || !mapElRef.current) return;
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

        if (!mapRef.current) {
          mapRef.current = new kakao.maps.Map(mapElRef.current, {
            center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
            level: 5,
          });
          infoWindowRef.current = new kakao.maps.InfoWindow({ zIndex: 2 });
        }

        const map = mapRef.current;
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }

        let coords: any | null = null;
        for (const query of locationQueries) {
          coords = (await geocodeAddress(kakao, query)) ?? (await findByKeyword(kakao, query));
          if (coords) break;
        }

        if (!active) return;
        if (!coords) {
          setError("주소 기반으로 위치를 찾지 못했습니다.");
          map.setCenter(new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
          map.setLevel(7);
          return;
        }

        const marker = new kakao.maps.Marker({
          map,
          position: coords,
          title: selected.title,
          image: buildMarkerImage(kakao, markerColor),
        });
        markerRef.current = marker;

        map.setCenter(coords);
        map.setLevel(4);

        const content = `
          <div style="padding:10px 12px;max-width:260px;font-size:12px;line-height:1.45;">
            <div style="font-weight:700;margin-bottom:4px;">${escapeHtml(selected.title)}</div>
            <div style="color:#334155;margin-bottom:3px;">상태: ${escapeHtml(selected.status)}</div>
            <div style="color:#64748b;">${escapeHtml(selected.address)}</div>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "지도 로딩 중 오류가 발생했습니다.");
      }
    }

    void drawMap();
    return () => {
      active = false;
    };
  }, [appKey, locationQueries, markerColor, selected]);

  if (!selected) return null;

  return (
    <div className="search-detail-map-wrap">
      <div className="search-detail-map-title">
        위치 지도
        <span className="search-detail-map-legend">
          <i className="search-detail-map-dot" style={{ backgroundColor: markerColor }} />
          {statusText || "상태 미상"}
        </span>
      </div>
      {error ? <div className="search-detail-map-message is-error">{error}</div> : null}
      <div ref={mapElRef} className="search-detail-map-canvas" />
    </div>
  );
}
