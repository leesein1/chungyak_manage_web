/*
 * @file-overview
 * 파일: src/pages/schlog/types.ts
 * 설명: SCHLog 화면에서 사용하는 타입 정의를 제공합니다.
 */

export type LogStatusFilter = "ALL" | "SUCCESS" | "FAILED";
export type JobCodeFilter = "ALL" | "SYNC" | "CLOSE";

export type ScheduleLogItem = {
  idx: number;
  jobCode: number;
  jobCodeName?: string;
  jobDesc?: string;
  status?: string;
  startedAt: string;
  endedAt?: string;
  scheduleNote?: string;
};

export type ScheduleLogQuery = {
  startedFrom: string;
  startedTo: string;
  status: LogStatusFilter;
  jobCode: JobCodeFilter;
};

