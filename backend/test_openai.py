#!/usr/bin/env python3
"""
Test script for OpenAI Platform integration in LearnovateX
Run this to verify that OpenAI is properly configured.
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import OpenAI
from openai import OpenAI

async def test_openai():
    """Test OpenAI Platform connection and basic functionality"""

    # Get configuration
    api_key = os.getenv('OPENAI_API_KEY', '')
    model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    ai_mode = os.getenv('AI_MODE', 'demo')

    print("🔍 Testing OpenAI Platform Configuration")
    print("=" * 50)

    # Check configuration
    if ai_mode != 'openai':
        print("❌ AI_MODE is not set to 'openai'")
        print(f"   Current AI_MODE: {ai_mode}")
        print("   Please set AI_MODE=openai in your .env file")
        return False

    if not api_key or api_key.startswith('your_actual_openai_api_key_here'):
        print("❌ OPENAI_API_KEY is not configured")
        print("   Please set your OpenAI API key in .env")
        return False

    print("✅ Configuration looks good")
    print(f"   API Key: {'*' * 20}...{api_key[-4:] if api_key else 'None'}")
    print(f"   Model: {model}")

    # Test connection
    print("\n🔗 Testing OpenAI connection...")

    try:
        client = OpenAI(api_key=api_key)

        # Test with a simple prompt
        test_prompt = "Hello! Please respond with just 'OpenAI is working!' if you can read this."

        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": test_prompt}],
            max_tokens=50,
            temperature=0.1,
        )

        ai_response = response.choices[0].message.content.strip()

        if "OpenAI is working" in ai_response:
            print("✅ OpenAI connection successful!")
            print(f"   Response: {ai_response}")
            return True
        else:
            print("⚠️  Unexpected response from OpenAI")
            print(f"   Response: {ai_response}")
            return False

    except Exception as e:
        print("❌ OpenAI connection failed")
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
        print(f"   Tutor Response: {tutor_response[:100]}...")

        # Test code evaluation
        print("\n💻 Testing Code Evaluation...")
        code_response = await get_ai_response(
            "Evaluate this Python code: x = 5; print(x)",
            "test_session",
            response_type="code"
        )
        print(f"   Code Response: {code_response[:100]}...")

        # Test resume analysis
        print("\n📄 Testing Resume Analysis...")
        resume_response = await get_ai_response(
            "Analyze this resume summary: Experienced Python developer with 3 years of experience.",
            "test_session",
            response_type="resume"
        )
        print(f"   Resume Response: {resume_response[:100]}...")

        # Test interview questions
        print("\n🎤 Testing Interview Questions...")
        interview_response = await get_ai_response(
            "Ask me a Python interview question.",
            "test_session",
            response_type="interview"
        )
        print(f"   Interview Response: {interview_response[:100]}...")

        print("\n✅ LearnovateX AI integration test completed!")
        return True

    except Exception as e:
        print("❌ LearnovateX AI integration test failed")
        print(f"   Error: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 LearnovateX OpenAI Integration Test")
    print("=" * 50)

    # Test OpenAI connection
    openai_ok = await test_openai()

    if openai_ok:
        # Test LearnovateX integration
        learnovate_ok = await test_learnovatex_ai()
    else:
        print("\n⏭️  Skipping LearnovateX integration test due to OpenAI connection failure")
        learnovate_ok = False

    print("\n" + "=" * 50)
    if openai_ok and learnovate_ok:
        print("🎉 All tests passed! OpenAI is properly configured for LearnovateX.")
    else:
        print("❌ Some tests failed. Please check your configuration.")

if __name__ == "__main__":
    asyncio.run(main())