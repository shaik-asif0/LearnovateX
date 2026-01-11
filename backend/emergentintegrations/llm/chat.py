import asyncio


class UserMessage:
    def __init__(self, text: str):
        self.text = text


class LlmChat:
    def __init__(self, api_key: str, session_id: str, system_message: str):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.model_type = None
        self.model_name = None

    def with_model(self, model_type: str, model_name: str) -> "LlmChat":
        self.model_type = model_type
        self.model_name = model_name
        return self

    async def send_message(self, user_message: UserMessage) -> str:
        # Provide a deterministic placeholder response so the server can run locally.
        await asyncio.sleep(0)
        template = (
            "CORRECT: Yes\n"
            "TIME_COMPLEXITY: O(n)\n"
            "SPACE_COMPLEXITY: O(1)\n"
            "QUALITY: 8\n"
            "SCORE: 80\n"
            "SUGGESTIONS: This is a simulated response needed for local testing.\n"
        )
        return f"{template}SIMULATED_RESPONSE: Received '{user_message.text}'"
