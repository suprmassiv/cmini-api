import { CminiBoardType } from "@backend/cmini/types";
import { SortOrder, Toggle } from "types";
import { KeySearchKeyGroupProps } from "./KeySearchKeyGroup";

export type SearchApiArgs = {
  corpora: string;
  randomize?: string;
  query?: string;
  board?: CminiBoardType;
  sort?: SortOrder;
  sortBy?: SearchSortField;
  minSfb?: number;
  maxSfb?: number;
  minSfs?: number;
  maxSfs?: number;
  minFsb?: number;
  maxFsb?: number;
  minRedirect?: number;
  maxRedirect?: number;
  minPinkyOff?: number;
  maxPinkyOff?: number;
  minAlternate?: number;
  maxAlternate?: number;
  minRoll?: number;
  maxRoll?: number;
  minRollRatio?: number;
  maxRollRatio?: number;
  minLeftHand?: number;
  maxLeftHand?: number;
  minRightHand?: number;
  maxRightHand?: number;
  author?: string;
  authorId?: string;
  name?: string;
  keyQuery?: string;
  createdBefore?: string;
  modifiedBefore?: string;
  createdAfter?: string;
  modifiedAfter?: string;
  hasThumb?: boolean;
};

export type AutocompleteApiArgs = {
  corpora: string;
  query: string;
  sort?: SortOrder | undefined;
  sortBy?: SearchSortField;
};

export enum SearchRangeField {
  Sfs = "sfs",
  Sfb = "sfb",
  Fsb = "fsb",
  Redirect = "redirect",
  PinkyOff = "pinkyOff",
  Alternate = "alternate",
  Roll = "roll",
  RollRatio = "rollRatio",
  LeftHand = "leftHand",
  RightHand = "rightHand",
}

export enum SearchSortField {
  Name = "name",
  Author = "author",

  Sfs = "sfs",
  Sfb = "sfb",
  Fsb = "fsb",
  Redirect = "redirect",
  PinkyOff = "pinkyOff",
  Alternate = "alternate",
  Roll = "roll",
  RollRatio = "rollRatio",
  LeftHand = "leftHand",
  RightHand = "rightHand",
}

export type SearchState = {
  constraints: SearchConstraints;
  query: string;
  board: CminiBoardType | undefined;

  sfb: number[];
  sfs: number[];
  fsb: number[];
  redirect: number[];
  pinkyOff: number[];
  alternate: number[];
  roll: number[];
  rollRatio: number[];
  handUse: number[];

  thumbsOnly: Toggle;

  randomize: string;
  sort: SortOrder | undefined;
  sortBy: SearchSortField | undefined;
  valid: boolean;
  empty: boolean;
  dirty: boolean;
  key: string;
};

export enum SearchStateQueryKeys {
  sort,
  sortBy,
  query,
  board,
  sfb,
  sfs,
  fsb,
  redirect,
  pinkyOff,
  alternate,
  roll,
  rollRatio,
  handUse,
  thumbsOnly,
  randomize,
}
export enum AppStateQueryKeys {
  corpora,
}

export type KeySearchState = {
  left: KeySearchKeyGroupProps[];
  either: KeySearchKeyGroupProps[];
  right: KeySearchKeyGroupProps[];
  editing: boolean;
  empty: boolean;
  valid: boolean;
  dirty: boolean;
  output: string;

  getHandGroups: (hand: KeySearchHandConstraint) => KeySearchKeyGroupProps[];
  getKeyGroup: (
    hand: KeySearchHandConstraint,
    index: number,
  ) => KeySearchKeyGroupProps;
  isProposedEditValid: (
    value: string,
    hand: KeySearchHandConstraint,
    groupIndex: number,
    keyIndex: number,
  ) => boolean;
};

export type SearchStateValues = Omit<
  SearchState,
  "constraints" | "valid" | "empty" | "key" | "dirty"
>;

export type KeySearchStateValues = Omit<
  KeySearchState,
  | "empty"
  | "editing"
  | "valid"
  | "dirty"
  | "output"
  | "getHandGroups"
  | "getKeyGroup"
  | "isProposedEditValid"
>;

export type SearchConstraints = Record<
  SearchRangeField,
  { min: number; max: number }
>;

export enum KeySearchHandConstraint {
  Left = "left",
  Right = "right",
  Either = "either",
}
