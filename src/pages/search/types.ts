/*
 * @file-overview
 * 파일: src/pages\search\types.ts
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

export type SearchStatusFilter = "all" | "접수예정" | "접수중" | "접수마감";

export type SearchListItem = {
  id: string;
  apiId: string;
  title: string;
  complex: string;
  region: string;
  period: string;
  status: string;
  ddayText: string;
  ddayValue: number;
  url: string;
  favored: boolean;
};

export type SearchDetailItem = {
  id: string;
  title: string;
  complex: string;
  region: string;
  address: string;
  period: string;
  status: string;
  rawStatus: string;
  ddayText: string;
  url: string;
  isFavorite: boolean;
  announcementDateText: string;
};

export type SearchFilterParams = {
  keyword: string;
  status: SearchStatusFilter;
  onlyOngoing: boolean;
  onlySoon: boolean;
  onlyFavorite: boolean;
  beginFrom: string;
  beginTo: string;
};
