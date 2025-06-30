export enum CminiBoardType {
    Staggered, Mini, Ortho
}

export enum CminiFinger {
    LT, LI, LM, LR, LP, RT, RI, RM, RR, RP
}

export enum CminiHand {
    Left, Right
}

export type CminiKey = {
    column: number
    row: number
    key: number
    finger: CminiFinger
}

export type CminiLayout = {
    layoutHash: string;
    boardHashes: string[]
    metaHashes: string[]
    keys: CminiKey[]
    encodedKeys: string
}

export type CminiBoardLayout = {
    layoutHash: string;
    boardHash: string;
    board: CminiBoardType;
    metaHashes: string[]
}

export type CminiMeta = {
    name: string;
    layoutHash: string;
    boardHash: string;
    metaHash: string;
    author: string;
    authorId: string;
    likes: number
    link: string;
}

export type CminiStats = {
    corpora: string;
    layoutHash: string;
    boardHash: string
    alternate: number;
    rollIn: number;
    rollOut: number;
    oneIn: number;
    oneOut: number;
    redirect: number;
    badRedirect: number;
    sfb: number;
    pinkyOff: number;
    sfs: number;
    sfsAlt: number;
    fsb: number;
    hsb: number;
    leftHand: number;
    rightHand: number;
    fingers: {
        rightRing: number;
        leftRing: number;
        rightIndex: number;
        leftIndex: number;
        rightMiddle: number;
        leftMiddle: number;
        rightPinky: number;
        leftPinky: number;
        leftThumb: number;
        rightThumb: number
    };
};

export type CminiStatsByCorpora = Map<string, CminiStats>

export type CminiMetric = {
    min: number;
    max: number;
    name: string
}

export type CminiHeatmap = Map<string, number>

export enum CminiMetricName {
    Alternate = 'alternate',
    RollIn = 'roll-in',
    RollOut = 'roll-out',
    OnehIn = 'oneh-in',
    OnehOut = 'oneh-out',
    Redirect = 'redirect',
    BadRedirect = 'bad-redirect',
    Sfb = 'sfb',
    DsfbRed = 'dsfb-red',
    DsfbAlt = 'dsfb-alt',
    Fsb = 'fsb',
    Hsb = 'hsb',
    PinkyOff = 'pinky-off',
    RightRing = 'RR',
    LM = 'LM',
    LP = 'LP',
    RP = 'RP',
    LI = 'LI',
    RI = 'RI',
    LR = 'LR',
    LH = 'LH',
    RH = 'RH',
    LT = 'LT',
    RT = 'RT'
}