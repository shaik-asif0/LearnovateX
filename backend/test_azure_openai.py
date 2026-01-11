#!/usr/bin/env python3
"""
Test script for Azure OpenAI integration in LearnovateX
Run this to verify that Azure OpenAI is properly configured.
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Azure OpenAI
from openai import AzureOpenAI

async def test_azure_openai():
    """Test Azure OpenAI connection and basic functionality"""

    # Get configuration
    api_key = os.getenv('AZURE_OPENAI_API_KEY', '')
    endpoint = os.getenv('AZURE_OPENAI_ENDPOINT', '')
    deployment = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-4')
    ai_mode = os.getenv('AI_MODE', 'demo')

    print("🔍 Testing Azure OpenAI Configuration")
    print("=" * 50)

    # Check configuration
    if ai_mode != 'azure':
        print("❌ AI_MODE is not set to 'azure'")
        print(f"   Current AI_MODE: {ai_mode}")
        print("   Please set AI_MODE=azure in your .env file")
        return False

    if not api_key or api_key == 'your_actual_azure_openai_api_key_here':
        print("❌ AZURE_OPENAI_API_KEY is not configured")
        print("   Please set your Azure OpenAI API key in .env")
        return False

    if not endpoint or endpoint == 'https://your-resource-name.openai.azure.com/':
        print("❌ AZURE_OPENAI_ENDPOINT is not configured")
        print("   Please set your Azure OpenAI endpoint in .env")
        return False

    print("✅ Configuration looks good")
    print(f"   API Key: {'*' * 20}...{api_key[-4:] if api_key else 'None'}")
    print(f"   Endpoint: {endpoint}")
    print(f"   Deployment: {deployment}")

    # Test connection
    print("\n🔗 Testing Azure OpenAI connection...")

    try:
        client = AzureOpenAI(
            api_key=api_key,
            api_version="2024-02-01",
            azure_endpoint=endpoint
        )

        # Test with a simple prompt
        test_prompt = "Hello! Please respond with just 'Azure OpenAI is working!' if you can read this."

        response = client.chat.completions.create(
            model=deployment,
            messages=[{"role": "user", "content": test_prompt}],
            max_tokens=50,
            temperature=0.1,
        )

        ai_response = response.choices[0].message.content.strip()

        if "Azure OpenAI is working" in ai_response:
            print("✅ Azure OpenAI connection successful!")
            print(f"   Response: {ai_response}")
            return True
        else:
            print("⚠️  Unexpected response from Azure OpenAI")
            print(f"   Response: {ai_response}")
            return False

    except Exception as e:
        print("❌ Azure OpenAI connection failed")
        print(f"   Error: {str(e)}")
        return False

async def test_learnovatex_ai():
    """Test LearnovateX AI integration"""
    print("\n🎓 Testing LearnovateX AI Integration")
    print("=" * 50)

    try:
        # Import server functions
        from server import get_ai_response

        # Test AI tutor
        print("🧠 Testing AI Tutor...")
        tutor_response = await get_ai_response(
            "Explain what a variable is in Python with a simple example.",
            "test_session",
            response_type="tutor"
        )

        if "demo" in tutor_response.lower() or len(tutor_response) < 50:
            print("⚠️  AI Tutor returned demo/short response")
            print(f"   Response: {tutor_response[:100]}...")
            return False
        else:
            print("✅ AI Tutor working with real responses")
            print(f"   Response length: {len(tutor_response)} characters")

        # Test code evaluation
        print("\n💻 Testing Code Evaluation...")
        code_response = await get_ai_response(
            "Evaluate this Python code: print('Hello World')",
            "test_session",
            response_type="code"
        )

        if "demo" in code_response.lower() or len(code_response) < 50:
            print("⚠️  Code Evaluation returned demo/short response")
            return False
        else:
            print("✅ Code Evaluation working with real responses")
            print(f"   Response length: {len(code_response)} characters")

        return True

    except Exception as e:
        print("❌ LearnovateX AI integration test failed")
        print(f"   Error: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 LearnovateX Azure OpenAI Integration Test")
    print("=" * 60)

    # Test Azure OpenAI directly
    azure_ok = await test_azure_openai()

    if not azure_ok:
        print("\n❌ Azure OpenAI configuration issues found.")
        print("Please check your .env file and AZURE_SETUP.md for configuration steps.")
        return

    # Test LearnovateX integration
    learnovatex_ok = await test_learnovatex_ai()

    if learnovatex_ok:
        print("\n🎉 All tests passed! LearnovateX is ready with real Azure OpenAI responses.")
        print("\nYou can now:")
        print("• Use AI Tutor for real-time explanations")
        print("• Get code evaluations with GPT-4")
        print("• Analyze resumes with AI")
        print("• Practice interviews with intelligent feedback")
    else:
        print("\n⚠️  Azure OpenAI is configured but LearnovateX integration may have issues.")
        print("Check server logs for more details.")

if __name__ == "__main__":
    asyncio.run(main())