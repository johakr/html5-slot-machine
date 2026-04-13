/**
 * Jest 配置文件
 * HTML5 老虎机游戏测试配置
 */

module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json'],
  
  // 转换器配置
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // 模块名称映射
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|jpeg|gif|webp)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/js/index.js',
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // 覆盖率报告目录
  coverageDirectory: '<rootDir>/coverage',
  
  // 覆盖率报告格式
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  
  // 测试超时时间
  testTimeout: 30000,
  
  // 详细输出
  verbose: true,
  
  // 测试前清理 mock
  clearMocks: true,
  
  // 重置 mock
  resetMocks: false,
  
  // 恢复 mock
  restoreMocks: false,
};
