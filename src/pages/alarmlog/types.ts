/*
 * @file-overview
 * 파일: src/pages/alarmlog/types.ts
 * 설명: 조회로그 화면에서 사용하는 타입 정의를 제공합니다.
 */

export type AlarmSendStatusFilter = "ALL" | "SUCCESS" | "FAIL";

export type AlarmLogItem = {
  idx: number;
  sendStatus?: string;
  sendAt: string;
  target?: string;
  message?: string;
};

export type AlarmLogQuery = {
  sendFrom: string;
  sendTo: string;
  sendStatus: AlarmSendStatusFilter;
};

