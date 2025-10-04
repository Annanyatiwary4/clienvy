const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

/**
 * Calculate Shannon entropy of a string
 * Higher entropy indicates more randomness (potential secret)
 */
function calculateEntropy(str) {
  if (!str || str.length === 0) return 0;
  
  const freq = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  const len = str.length;
  let entropy = 0;
  
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

/**
 * Analyze if a string has high entropy (likely a secret)
 */
function analyzeEntropy(value, options = {}) {
  const {
    minLength = 8,
    entropyThreshold = 4.0,
    minEntropyLength = 16
  } = options;
  
  if (value.length < minLength) {
    return {
      isHighEntropy: false,
      entropy: 0,
      reason: 'String too short for entropy analysis'
    };
  }
  
  const entropy = calculateEntropy(value);
  const isHighEntropy = entropy >= entropyThreshold && value.length >= minEntropyLength;
  
  return {
    isHighEntropy,
    entropy: parseFloat(entropy.toFixed(2)),
    reason: isHighEntropy 
      ? 'High entropy detected - likely a secret'
      : entropy < entropyThreshold 
        ? 'Low entropy - likely not a secret'
        : 'String too short for high entropy threshold'
  };
}

/**
 * Validate secret format based on known patterns
 */
function validateSecretFormat(value, secretType) {
  const formatValidators = {
    'STRIPE_API_KEY': {
      pattern: /^(sk|rk)_(test|live)_[a-zA-Z0-9]{24,}$/,
      description: 'Stripe API key format: sk_(test|live)_...'
    },
    'SENDGRID_API_KEY': {
      pattern: /^SG\.[a-zA-Z0-9._-]{20,}\.[a-zA-Z0-9._-]{20,}$/,
      description: 'SendGrid API key format: SG.xxx.xxx'
    },
    'JWT_TOKEN': {
      pattern: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      description: 'JWT token format: eyJ...header.payload.signature'
    },
    'OPENAI_API_KEY': {
      pattern: /^sk-[a-zA-Z0-9]{32,}$/,
      description: 'OpenAI API key format: sk-...'
    },
    'HUGGINGFACE_TOKEN': {
      pattern: /^hf_[a-zA-Z0-9]{32,}$/,
      description: 'Hugging Face token format: hf_...'
    },
    'GROQ_API_KEY': {
      pattern: /^gsk_[a-zA-Z0-9]{52,}$/,
      description: 'GROQ API key format: gsk_...'
    },
    'AWS_ACCESS_KEY_ID': {
      pattern: /^AKIA[0-9A-Z]{16}$/,
      description: 'AWS Access Key ID format: AKIA...'
    },
    'MONGODB_URI': {
      pattern: /^mongodb(\+srv)?:\/\/[^\s"'`]+$/,
      description: 'MongoDB URI format: mongodb://... or mongodb+srv://...'
    },
    'POSTGRES_URI': {
      pattern: /^postgres(ql)?:\/\/[^\s"'`]+$/,
      description: 'PostgreSQL URI format: postgresql://...'
    }
  };
  
  const validator = formatValidators[secretType];
  if (!validator) {
    return {
      isValidFormat: null,
      reason: `No format validator available for ${secretType}`
    };
  }
  
  const isValidFormat = validator.pattern.test(value);
  return {
    isValidFormat,
    reason: isValidFormat 
      ? `Valid ${secretType} format`
      : `Invalid format. Expected: ${validator.description}`,
    expectedFormat: validator.description
  };
}

/**
 * Perform live validation of API keys
 */
async function performLiveValidation(value, secretType, options = {}) {
  const { timeout = 5000, skipLiveValidation = false } = options;
  
  if (skipLiveValidation) {
    return {
      isValid: null,
      reason: 'Live validation skipped',
      status: 'skipped'
    };
  }
  
  // Import axios dynamically to avoid dependency if not needed
  let axios;
  try {
    axios = require('axios');
  } catch (err) {
    return {
      isValid: null,
      reason: 'axios not available for live validation',
      status: 'dependency_missing'
    };
  }
  
  const validators = {
    'STRIPE_API_KEY': async (key) => {
      try {
        const response = await axios.get('https://api.stripe.com/v1/account', {
          headers: { 'Authorization': `Bearer ${key}` },
          timeout
        });
        return { isValid: true, status: 'valid', response: response.status };
      } catch (error) {
        if (error.response?.status === 401) {
          return { isValid: false, status: 'invalid', reason: 'Invalid API key' };
        }
        return { isValid: null, status: 'error', reason: error.message };
      }
    },
    
    'SENDGRID_API_KEY': async (key) => {
      try {
        const response = await axios.get('https://api.sendgrid.com/v3/user/account', {
          headers: { 'Authorization': `Bearer ${key}` },
          timeout
        });
        return { isValid: true, status: 'valid', response: response.status };
      } catch (error) {
        if (error.response?.status === 401) {
          return { isValid: false, status: 'invalid', reason: 'Invalid API key' };
        }
        return { isValid: null, status: 'error', reason: error.message };
      }
    },
    
    'OPENAI_API_KEY': async (key) => {
      try {
        const response = await axios.get('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` },
          timeout
        });
        return { isValid: true, status: 'valid', response: response.status };
      } catch (error) {
        if (error.response?.status === 401) {
          return { isValid: false, status: 'invalid', reason: 'Invalid API key' };
        }
        return { isValid: null, status: 'error', reason: error.message };
      }
    },
    
    'HUGGINGFACE_TOKEN': async (token) => {
      try {
        const response = await axios.get('https://huggingface.co/api/whoami', {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout
        });
        return { isValid: true, status: 'valid', response: response.status };
      } catch (error) {
        if (error.response?.status === 401) {
          return { isValid: false, status: 'invalid', reason: 'Invalid token' };
        }
        return { isValid: null, status: 'error', reason: error.message };
      }
    }
  };
  
  const validator = validators[secretType];
  if (!validator) {
    return {
      isValid: null,
      status: 'unsupported',
      reason: `Live validation not supported for ${secretType}`
    };
  }
  
  try {
    return await validator(value);
  } catch (error) {
    return {
      isValid: null,
      status: 'error',
      reason: `Validation error: ${error.message}`
    };
  }
}

/**
 * Comprehensive secret validation
 */
async function validateSecret(secret, options = {}) {
  const {
    checkEntropy = true,
    checkFormat = true,
    performLiveCheck = false,
    entropyOptions = {},
    liveValidationOptions = {}
  } = options;
  
  const result = {
    secret: {
      key: secret.key,
      type: secret.name || 'UNKNOWN',
      value: secret.value,
      file: secret.file,
      line: secret.line
    },
    validation: {
      entropy: null,
      format: null,
      liveValidation: null,
      overall: {
        score: 0,
        confidence: 'low',
        recommendation: 'unknown'
      }
    }
  };
  
  // Entropy analysis
  if (checkEntropy) {
    result.validation.entropy = analyzeEntropy(secret.value, entropyOptions);
  }
  
  // Format validation
  if (checkFormat) {
    result.validation.format = validateSecretFormat(secret.value, secret.name || secret.key);
  }
  
  // Live validation
  if (performLiveCheck) {
    result.validation.liveValidation = await performLiveValidation(
      secret.value, 
      secret.name || secret.key, 
      liveValidationOptions
    );
  }
  
  // Calculate overall score and confidence
  let score = 0;
  let factors = 0;
  
  if (result.validation.entropy?.isHighEntropy) {
    score += 30;
    factors++;
  }
  
  if (result.validation.format?.isValidFormat === true) {
    score += 40;
    factors++;
  } else if (result.validation.format?.isValidFormat === false) {
    score -= 20;
  }
  
  if (result.validation.liveValidation?.isValid === true) {
    score += 50;
    factors++;
  } else if (result.validation.liveValidation?.isValid === false) {
    score -= 30;
  }
  
  // Base score for detected pattern
  score += 20;
  factors++;
  
  result.validation.overall.score = Math.max(0, Math.min(100, score));
  
  // Determine confidence level
  if (result.validation.overall.score >= 80) {
    result.validation.overall.confidence = 'high';
    result.validation.overall.recommendation = 'Highly likely to be a valid secret - should be secured';
  } else if (result.validation.overall.score >= 60) {
    result.validation.overall.confidence = 'medium';
    result.validation.overall.recommendation = 'Likely a secret - recommend securing';
  } else if (result.validation.overall.score >= 40) {
    result.validation.overall.confidence = 'low';
    result.validation.overall.recommendation = 'Possibly a secret - review manually';
  } else {
    result.validation.overall.confidence = 'very-low';
    result.validation.overall.recommendation = 'Unlikely to be a valid secret - may be false positive';
  }
  
  return result;
}

/**
 * Validate multiple secrets
 */
async function validateSecrets(secrets, options = {}) {
  const { concurrent = 3 } = options;
  
  const results = [];
  
  // Process secrets in batches to avoid overwhelming APIs
  for (let i = 0; i < secrets.length; i += concurrent) {
    const batch = secrets.slice(i, i + concurrent);
    const batchPromises = batch.map(secret => validateSecret(secret, options));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches for rate limiting
    if (i + concurrent < secrets.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Generate validation report
 */
function generateValidationReport(validationResults) {
  const summary = {
    total: validationResults.length,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    veryLowConfidence: 0,
    liveValidated: 0,
    formatValid: 0,
    highEntropy: 0
  };
  
  const details = [];
  
  for (const result of validationResults) {
    const confidence = result.validation.overall.confidence;
    summary[`${confidence.replace('-', '')}Confidence`]++;
    
    if (result.validation.liveValidation?.isValid === true) {
      summary.liveValidated++;
    }
    
    if (result.validation.format?.isValidFormat === true) {
      summary.formatValid++;
    }
    
    if (result.validation.entropy?.isHighEntropy === true) {
      summary.highEntropy++;
    }
    
    details.push({
      key: result.secret.key,
      type: result.secret.type,
      file: result.secret.file,
      line: result.secret.line,
      confidence: confidence,
      score: result.validation.overall.score,
      recommendation: result.validation.overall.recommendation,
      entropy: result.validation.entropy?.entropy || 'N/A',
      formatValid: result.validation.format?.isValidFormat || 'N/A',
      liveValid: result.validation.liveValidation?.isValid || 'N/A'
    });
  }
  
  return { summary, details };
}

module.exports = {
  calculateEntropy,
  analyzeEntropy,
  validateSecretFormat,
  performLiveValidation,
  validateSecret,
  validateSecrets,
  generateValidationReport
};
