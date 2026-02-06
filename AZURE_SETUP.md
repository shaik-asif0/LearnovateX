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

   # LearnovateX AI Provider Setup Guide (OpenAI or Azure OpenAI)

   This guide explains how to configure **either**:

   - **OpenAI Platform (openai.com)** API key (recommended if you can’t deploy models in Azure), or
   - **Azure OpenAI** (requires creating a deployment in Azure)

   So that the AI features use **real responses** instead of demo/sample responses.

   ## Option A (Recommended): Use OpenAI Platform (openai.com)

   If Azure won’t let you deploy a model in your region/subscription, OpenAI Platform is the simplest option.

   ### Step A1: Create an OpenAI API key

   1. Create an OpenAI Platform account
   2. Create an API key in the OpenAI developer dashboard
   3. Copy the key (you will not be able to view it again later)

   ### Step A2: Configure the backend

   Start from the template:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Then set:

   ```env
   AI_MODE=openai
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY
   OPENAI_MODEL=gpt-4o-mini
   ```

   ### Step A3: Run the backend

   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

   Check:

   - `GET http://localhost:8000/api/status`

   It should show `ai_mode: openai` and `ai_service.mode: OpenAI`.

   ***

   ## Option B: Use Azure OpenAI

   ## What you need from Azure (3 values)

   You must obtain and configure **all three**:

   1. **AZURE_OPENAI_API_KEY** (Key 1 or Key 2)
   2. **AZURE_OPENAI_ENDPOINT** (base endpoint URL)
   3. **AZURE_OPENAI_DEPLOYMENT** (your _deployment name_ in Azure AI Foundry / OpenAI Studio)

   In this repo, these are read from environment variables in the backend and used by the Azure OpenAI SDK (`AzureOpenAI`).

   ## How this API key affects features in this project

   When `AI_MODE=azure` and the Azure values are configured, the backend uses Azure OpenAI for:

   - **AI Tutor**: `POST /api/tutor/chat`
   - **Code analysis / evaluation**: `POST /api/code/evaluate`
   - **Resume analysis**: `POST /api/resume/analyze`
   - **Mock interviews**:
     - `POST /api/interview/start`
     - `POST /api/interview/evaluate`

   When Azure is not configured (or you’re offline), the backend automatically falls back to **demo mode** responses.

   ### Important: “Tracking student information” is NOT done by the API key

   The **Azure OpenAI API key does not identify or track your students** by itself.

   What actually tracks student progress in this project:

   - Users authenticate and the backend uses a **JWT** that contains the logged-in user identity.
   - Each AI request is handled for the current user and results are stored in the backend database (**SQLite**, `backend/learnovatex.db`).
   - The **Career Readiness** page is computed mainly from stored activity metrics (code scores, resume score, interview readiness, learning consistency). It’s not “tracked by the API key”.

   If you ever want to associate Azure OpenAI usage to a student in Azure logs, you typically add a user identifier to your app-level logs (recommended) and/or pass user metadata where supported. This repo currently tracks users in its own DB.

   ***

   ## Step-by-step: Get an Azure OpenAI API key

   > Note: Azure UI labels change sometimes (Azure OpenAI Studio vs Azure AI Foundry). The steps below match the common 2025/2026 Azure flow.

   ### Step 0 (only if required): Get Azure OpenAI access

   Depending on your subscription/tenant, you may need approval to use Azure OpenAI models.

   - If you can’t create an Azure OpenAI resource or can’t deploy models, check your organization policy or request access from your Azure admin.

   ### Step 1: Create an Azure OpenAI resource

   1. Open Azure Portal: https://portal.azure.com
   2. Click **Create a resource**
   3. Search for **Azure OpenAI** (sometimes listed under **Azure AI services**)
   4. Click **Create**
   5. Fill in:
      - **Subscription**: your subscription
      - **Resource group**: create new or select existing
      - **Region**: choose one that supports Azure OpenAI for your subscription
      - **Name**: any unique name (example: `learnovatex-openai`)
      - **Pricing tier**: typically `Standard S0`
   6. Click **Review + create** → **Create**

   ### Step 2: Copy the Endpoint and API Key

   1. Open your Azure OpenAI resource
   2. Go to **Keys and Endpoint**
   3. Copy:
      - **Key 1** (or **Key 2**) → this becomes `AZURE_OPENAI_API_KEY`
      - **Endpoint** → this becomes `AZURE_OPENAI_ENDPOINT`

   The endpoint looks like:

   `https://<your-resource-name>.openai.azure.com/`

   ✅ Use the **base endpoint** only (do not add `/openai/deployments/...`).

   ### Step 3: Create a model deployment (this becomes AZURE_OPENAI_DEPLOYMENT)

   In Azure, you do **not** call the model by raw name (like `gpt-4o-mini`) from this repo.
   This project passes the deployment name as `model=...`.

   1. From your Azure OpenAI resource, open **Azure AI Foundry portal** / **Azure OpenAI Studio**
   2. Go to **Deployments** (sometimes: **Model deployments**)
   3. Click **Create new deployment**
   4. Choose a model you have access to (examples):
      - `gpt-4o-mini` (often good cost/performance)
      - `gpt-4o`
      - `gpt-35-turbo` (older, cheaper)
   5. Set **Deployment name** (example: `learnovatex-gpt4o-mini`)
   6. Create the deployment

   That deployment name is what you put into:

   `AZURE_OPENAI_DEPLOYMENT=learnovatex-gpt4o-mini`

   ***

   ## Configure this project (Local Development)

   ### Step 4: Set backend environment variables

   Start from the template:

   ```bash
   # From repo root
   cp backend/.env.example backend/.env
   ```

   Then edit the file:

   - `backend/.env`

   Add these values:

   ```env
   # Use Azure OpenAI for real responses
   AI_MODE=azure

   # Azure OpenAI credentials
   AZURE_OPENAI_API_KEY=YOUR_KEY_1_OR_KEY_2
   AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE-NAME.openai.azure.com/

   # IMPORTANT: this is the *deployment name* you created in Azure AI Foundry
   AZURE_OPENAI_DEPLOYMENT=YOUR_DEPLOYMENT_NAME
   ```

   Common mistakes:

   - `AZURE_OPENAI_DEPLOYMENT` must match your deployment name **exactly** (case-sensitive).
   - `AZURE_OPENAI_ENDPOINT` must be the base endpoint and should start with `https://`.
   - Don’t use an OpenAI.com API key here; it must be an **Azure** key.

   ### Step 5: Install backend dependencies

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

   ### Step 6: Run a direct Azure test (recommended)

   This repo includes a test script:

   ```bash
   cd backend
   python test_azure_openai.py
   ```

   If it passes, you’ll see a successful message and a real response.

   ### Step 7: Run the backend and verify health

   Start the backend:

   ```bash
   cd backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

   Then check:

   - `GET http://localhost:8000/api/health`
   - `GET http://localhost:8000/api/status`

   If Azure is configured, `/api/status` will show the deployment name.

   ***

   ## Configure in Azure Hosting (App Service)

   If you deploy the backend to **Azure App Service**, do **not** rely on `backend/.env`.

   This project intentionally avoids overriding App Service settings by default.

   ### Step 1: Add App Settings

   1. Azure Portal → your **App Service** → **Configuration** → **Application settings**
   2. Add these keys:
      - `AI_MODE` = `azure`
      - `AZURE_OPENAI_API_KEY` = your key
      - `AZURE_OPENAI_ENDPOINT` = your endpoint
      - `AZURE_OPENAI_DEPLOYMENT` = your deployment name
   3. Save and restart the App Service

   ### Optional: DOTENV_OVERRIDE

   The backend loads `backend/.env` only for local development by default.
   In App Service, environment variables from Azure should take priority.

   Only if you _really_ want `.env` to override App Service settings, set:

   `DOTENV_OVERRIDE=true`

   (Not recommended for production.)

   ***

   ## Troubleshooting

   ### 1) AI still returns “demo mode” responses

   Check:

   - `AI_MODE=azure`
   - `AZURE_OPENAI_API_KEY` is set (not empty)
   - `AZURE_OPENAI_ENDPOINT` is set (not empty)
   - You have internet access (the backend falls back to demo mode if offline)

   ### 2) 401 / “Invalid API key”

   - Ensure you copied the key from **Keys and Endpoint** of your **Azure OpenAI resource**.
   - If you rotated keys, update `AZURE_OPENAI_API_KEY`.

   ### 3) “Deployment not found” / “The API deployment for this resource does not exist”

   - Verify the deployment exists in Azure AI Foundry / OpenAI Studio.
   - Ensure `AZURE_OPENAI_DEPLOYMENT` matches the deployment name exactly.

   ### 4) 403 / “Access denied”

   - Your subscription/tenant may not have model access in that region.
   - Try another region or request access from your Azure admin.

   ### 5) Rate limit / quota errors

   - Check Azure OpenAI quotas for your resource/region.
   - Use a smaller/cheaper model (like `gpt-4o-mini`) if available.
   - Reduce `max_tokens` or request rate (this backend retries up to 3 times).

   ***

   ## Security & privacy notes (important for resumes/interviews)

   - Never commit `backend/.env` (keep keys out of Git).
   - Treat resumes/interview answers as sensitive data.
   - For production, prefer storing secrets in **App Service Configuration** or **Azure Key Vault**.
   - Rotate keys regularly.

   ***

   ## Cost notes

   Azure OpenAI is billed by tokens and varies by model/region.
   Use Azure Portal billing/metrics to monitor usage and set budget alerts.
