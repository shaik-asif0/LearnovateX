# LearnovateX Azure OpenAI Setup Guide

This guide explains how to configure Azure OpenAI for real-time AI features in LearnovateX - an AI-powered learning and career readiness platform.

## Azure OpenAI Configuration (REQUIRED FOR AI FEATURES)

### Step 1: Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure OpenAI"
4. Click "Create"
5. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Create new or select existing
   - **Region**: Select a region that supports Azure OpenAI (e.g., East US, West Europe)
   - **Name**: Choose a unique name for your resource
   - **Pricing tier**: Select Standard S0

### Step 2: Deploy GPT-4 Model

1. After resource creation, go to your Azure OpenAI resource
2. Click "Go to Azure OpenAI Studio" or navigate to "Model deployments"
3. Click "Create new deployment"
4. Select "gpt-4" from the model list
5. Choose deployment name (e.g., "gpt-4")
6. Set deployment type to "Standard"
7. Click "Create"

### Step 3: Get API Credentials

1. In your Azure OpenAI resource, go to "Keys and Endpoint" section
2. Copy the following:
   - **API Key**: Either KEY 1 or KEY 2
   - **Endpoint**: The endpoint URL (e.g., `https://your-resource-name.openai.azure.com/`)

### Step 4: Update Environment Variables

Edit `backend/.env` file and update these values:

```env
AI_MODE=azure

AZURE_OPENAI_API_KEY=your_actual_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

### Step 5: Test the Configuration

1. Start the backend server:

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

2. Check the server logs for:

```
ℹ Azure OpenAI configured successfully
```

3. Test AI features in the frontend

## Troubleshooting

### Common Issues:

1. **"Azure OpenAI not configured" error**

   - Check that all three environment variables are set correctly
   - Ensure the API key is valid and not expired

2. **"Region not supported" error**

   - Make sure your Azure region supports Azure OpenAI
   - Try different regions like East US, West Europe, or Australia East

3. **"Deployment not found" error**

   - Verify the deployment name matches exactly what you created in Azure
   - Check that the model is deployed and active

4. **Rate limiting**
   - Azure OpenAI has rate limits based on your pricing tier
   - Consider upgrading if you hit limits frequently

## Cost Estimation

- **GPT-4**: ~$0.03 per 1K tokens (input) / $0.06 per 1K tokens (output)
- Typical conversation: 500-2000 tokens
- Monitor usage in Azure Portal under your OpenAI resource

## Security Notes

- Never commit API keys to version control
- Rotate keys regularly
- Use Azure Key Vault for production deployments
- Set up proper access controls in Azure

## AWS Bedrock Setup (For Full AI Capabilities)

### Prerequisites

1. An AWS Account (Free Tier eligible for some services)
2. AWS CLI installed (optional, for testing)

### Important: AWS Bedrock Pricing

> ⚠️ **Note**: AWS Bedrock is NOT included in AWS Free Tier. It charges per token:

| Model           | Input (per 1M tokens) | Output (per 1M tokens) |
| --------------- | --------------------- | ---------------------- |
| Claude 3 Haiku  | $0.25                 | $1.25                  |
| Claude 3 Sonnet | $3.00                 | $15.00                 |
| Claude 3 Opus   | $15.00                | $75.00                 |

**Estimated monthly costs:**

- Light usage (50 requests/day): ~$0.50-2/month with Haiku
- Medium usage (200 requests/day): ~$2-10/month with Haiku
- Heavy usage: Consider using demo mode for testing

### Step 1: Create IAM User

1. Go to [AWS Console](https://console.aws.amazon.com/) → IAM → Users
2. Click **Create User**
3. User name: `learning-platform-bedrock`
4. Click **Next**
5. Select **Attach policies directly**
6. Search and select: `AmazonBedrockFullAccess`
7. Click **Next** → **Create user**

### Step 2: Create Access Keys

1. Click on the created user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Select **Application running outside AWS**
5. Click **Next** → **Create access key**
6. **SAVE** the Access Key ID and Secret Access Key (you won't see the secret again!)

### Step 3: Enable Bedrock Model Access

1. Go to [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Select region: **US East (N. Virginia)** `us-east-1` (recommended)
3. Click **Model access** in the left sidebar
4. Click **Manage model access**
5. Enable these models:
   - ✅ **Anthropic Claude 3 Haiku** (recommended - cheapest)
   - ✅ **Anthropic Claude 3 Sonnet** (optional - better quality)
6. Click **Request model access**
7. Wait for approval (usually instant)

### Step 4: Configure Environment

Update `backend/.env` file:

```env
# Switch from demo to bedrock mode
AI_MODE=bedrock

# Your AWS credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your-access-key...
AWS_SECRET_ACCESS_KEY=your-secret-key-here

# Use Haiku for lowest cost
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

### Step 5: Test the Setup

```bash
cd backend
uvicorn server:app --reload --port 8000
```

Check the console output:

- ✅ `✓ AWS Bedrock client initialized successfully` - AWS is working
- ⚠️ `ℹ AWS credentials not configured - running in demo mode` - Still in demo mode

Test the health endpoint:

```bash
curl http://localhost:8000/api/health
```

---

## Available Model IDs

| Model           | ID                                        | Best For                 | Cost |
| --------------- | ----------------------------------------- | ------------------------ | ---- |
| Claude 3 Haiku  | `anthropic.claude-3-haiku-20240307-v1:0`  | Fast responses, low cost | $    |
| Claude 3 Sonnet | `anthropic.claude-3-sonnet-20240229-v1:0` | Balanced quality/cost    | $$   |
| Claude 3 Opus   | `anthropic.claude-3-opus-20240229-v1:0`   | Highest quality          | $$$  |
| Amazon Titan    | `amazon.titan-text-express-v1`            | AWS native option        | $    |

---

## Features Using AI

All these features work in both Demo and Bedrock modes:

| Feature         | Endpoint              | Description                     |
| --------------- | --------------------- | ------------------------------- |
| AI Tutor        | `/api/tutor/chat`     | Interactive learning assistance |
| Code Evaluation | `/api/code/evaluate`  | Code review and scoring         |
| Resume Analyzer | `/api/resume/analyze` | Resume credibility scoring      |
| Mock Interviews | `/api/interview/*`    | Interview practice              |

---

## Environment Configuration Reference

```env
# =============================================
# AI MODE: 'demo' (free) or 'bedrock' (AWS)
# =============================================
AI_MODE=demo

# =============================================
# AWS CREDENTIALS (only needed if AI_MODE=bedrock)
# =============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# =============================================
# SECURITY
# =============================================
JWT_SECRET=change-this-to-a-random-string
```

---

## Troubleshooting

### Server won't start

```bash
# Install dependencies first
pip install -r requirements.txt

# Check Python version (needs 3.8+)
python --version
```

### "Access Denied" Error

- Verify IAM user has `AmazonBedrockFullAccess` policy
- Check model access is enabled in Bedrock console
- Verify credentials in `.env` are correct (no quotes around values)

### "Model not found" Error

- Check the model ID is correct
- Ensure model access is approved
- Try region `us-east-1` (has most models)

### "Throttling" Error

- You've hit rate limits
- The code has automatic retry logic
- Consider using demo mode for testing

### AI Responses say "Demo Mode"

- Check `AI_MODE=bedrock` in `.env`
- Verify AWS credentials are set correctly
- Check server console for initialization messages

---

## Security Best Practices

1. **Never commit `.env` to Git** - It's in `.gitignore`
2. **Rotate access keys** regularly
3. **Use IAM roles** in production instead of access keys
4. **Change JWT_SECRET** in production
5. **Enable CloudTrail** for API auditing

---

## Cost Optimization Tips

1. **Start with Demo Mode** for development
2. **Use Claude 3 Haiku** - 10x cheaper than Sonnet
3. **Implement caching** for repeated queries
4. **Set billing alerts** in AWS Console
5. **Monitor usage** in CloudWatch

---

## API Health Check

Check system status anytime:

```bash
# Health check
curl http://localhost:8000/api/health

# Detailed status
curl http://localhost:8000/api/status
```

Response shows current AI mode and configuration status.
