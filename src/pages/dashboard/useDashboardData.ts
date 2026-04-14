/*
 * @file-overview
 * 파일: src/pages\dashboard\useDashboardData.ts
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import { useEffect, useMemo, useState } from "react";
import { fetchDashboardApis } from "./api";
import { buildDashboardStateFromApi, buildDateRangeQuery } from "./utils";
import {
  initialDashboardState,
  type ApiRcvhome,
  type DashboardState,
  type ScheduleLastResponse,
} from "./types";

// Promise.allSettled 결과에서 성공 값만 꺼내고, 실패 시 기본값으로 대체한다.
function getSettledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

// 일부 API가 실패해도 화면에 안내할 수 있도록 에러 메시지를 합친다.
function getPartialErrorText(results: PromiseSettledResult<unknown>[]) {
  const messages = results
    .filter((result) => result.status === "rejected")
    .map((result) => String(result.reason?.message ?? result.reason));

  return messages.length ? messages.join(" | ") : null;
}

// 대시보드에서 쓰는 4개 API를 호출하고 화면 상태를 구성하는 전용 훅.
export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DashboardState>(initialDashboardState);

  useEffect(() => {
    const abortController = new AbortController();

    // 대시보드 4개 API를 병렬 조회하고 결과를 단일 상태로 병합한다.
    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const query = buildDateRangeQuery();
        const results = await fetchDashboardApis(query, abortController.signal);

        const allRows = getSettledValue<ApiRcvhome[]>(results[0], []);
        const deadlineRows = getSettledValue<ApiRcvhome[]>(results[1], []);
        const favoriteRows = getSettledValue<ApiRcvhome[]>(results[2], []);
        const scheduleLast = getSettledValue<ScheduleLastResponse>(results[3], {});

        setState(
          buildDashboardStateFromApi(allRows, deadlineRows, favoriteRows, scheduleLast)
        );
        setError(getPartialErrorText(results));
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : "대시보드 로딩 실패");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      abortController.abort();
    };
  }, []);

  // 상단 Hero에 표시할 동기화 상태 문구를 계산한다.
  const heroStatusText = useMemo(() => {
    if (loading) return "동기화 상태 확인 중";
    return state.syncHealthy ? "정상 동기화" : "동기화 확인 필요";
  }, [loading, state.syncHealthy]);

  return {
    loading,
    error,
    state,
    heroStatusText,
  };
}
