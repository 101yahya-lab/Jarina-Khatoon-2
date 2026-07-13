// ========================================
// Process Error Handling
// ========================================
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});