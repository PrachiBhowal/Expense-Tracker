const requiredEnvVars = [
  'MONGO_URI',
  'PORT',
  'JWT_SECRET'
];

const validateEnv = () => {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file and add the missing variables.');
    process.exit(1);
  }
  
  console.log('✓ All required environment variables are set');
};

module.exports = validateEnv;