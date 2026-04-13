import { useEffect, useMemo, useState } from "react";
import { fetchDashboardApis } from "./api";
import { buildDashboardStateFromApi, buildDateRangeQuery } from "./utils";
import {
  initialDashboardState,
  type ApiRcvhome,
  type DashboardState,
  type ScheduleLastResponse,
} from "./types";

// allSettled 결과에서 성공 값만 꺼내고, 실패 시 기본값을 돌려줍니다.
function getSettledValue<T>(
  result: PromiseSettledResult<T>,
  fallback: T
): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

// 실패한 API들을 사람이 읽기 쉬운 문장으로 합칩니다.
function getPartialErrorText(results: PromiseSettledResult<unknown>[]) {
  const messages = results
    .filter((result) => result.status === "rejected")
    .map((result) => String(result.reason?.message ?? result.reason));

  return messages.length ? messages.join(" | ") : null;
}

// 대시보드 데이터 조회와 가공을 담당하는 커스텀 훅입니다.
export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DashboardState>(initialDashboardState);

  useEffect(() => {
    const abortController = new AbortController();

    // 대시보드 4개 API를 병렬 조회하고 화면 상태를 갱신합니다.
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
          buildDashboardStateFromApi(
            allRows,
            deadlineRows,
            favoriteRows,
            scheduleLast
          )
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

  // 히어로 상단의 동기화 상태 문구를 계산합니다.
  const heroStatusText = useMemo(() => {
    if (loading) return "동기화 확인 중";
    return state.syncHealthy ? "정상 동기화" : "동기화 확인 필요";
  }, [loading, state.syncHealthy]);

  return {
    loading,
    error,
    state,
    heroStatusText,
  };
}
