function methodMatches(expected, actual) {
    return 'ALL' === actual || expected === actual;
}

module.exports = methodMatches;
