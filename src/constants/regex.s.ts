/**
 * 5 min /^PT((?:[0-4]?\d)|(?:5[0-9]))M(?:([0-5]?\d)S)?$/
 * 10min /^PT(?:([0]?|[1-9]|10)M)?(?:([0-5]?[0-9])S)?$/
 * 15min /^PT((?:[0-9]?\d)|(?:1[0-4]\d)|(?:150))M(?:([0-5]?\d)S)?$/
 */

export const DURATION_REGEX = /^PT(?:([0]?|[1-9]|10)M)?(?:([0-5]?[0-9])S)?$/;
export const DOWNLOAD_PROGRESS =
    /\[download\]\s+\d{1,3}\.\d%\sof\s+\d+\.\d+\w+\sat\s+\d+\.\d+\w+\/s\s+ETA\s+\d+:\d{2}/;
