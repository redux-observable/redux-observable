module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js'
    ],

    tests: ['test/**/*.js'],
    debug: true,
    env: { type: 'node' },
    testFramework: 'mocha',
    compilers: {
      '**/*.js': wallaby.compilers.babel()
    }
  };
};
