
const isEmpty = value =>
value === undefined ||
value === null ||
(typeof value === 'object' && Object.keys(value).length === 0) ||
(typeof value === 'string' && value.trim().length === 0);

const ArrayHasEmptyString = (value, delimiter) =>
value.split(delimiter).map(i => i.trim()).indexOf("") > -1;

module.exports = {
    isEmpty,
    ArrayHasEmptyString
}