export interface Memory {
  role: string;
  content: string;
}

export interface ChatChunk {
  content?: string;
  memories?: Memory[];
  error?: string;
}

export interface Inference {
  id: number;
  fact: string;
  confidence: string;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function login(email: string, password: string): Promise<string> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }

  const data = await res.json();
  return data.access_token;
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed");
  }

  return res.json();
}

export async function getInferences(): Promise<Inference[]> {
  const res = await fetch(`${API_BASE}/profile/inferences`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load inferences");
  return res.json();
}

export async function deleteInference(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/profile/inferences/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete inference");
}

export async function sendChatMessage(
  message: string, 
  sessionId: string, 
  onChunk: (chunk: string) => void,
  onMemories: (memories: Memory[]) => void,
  onError: (err: string) => void
) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    if (!response.body) throw new Error("ReadableStream not supported in this browser.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice("data: ".length).trim();
          if (!dataStr) continue;
          
          try {
            const data: ChatChunk = JSON.parse(dataStr);
            if (data.error) {
              onError(data.error);
            } else if (data.memories) {
              onMemories(data.memories);
            } else if (data.content !== undefined) {
              onChunk(data.content);
            }
          } catch (e) {
            console.error("Error parsing JSON chunk:", e, "Chunk:", dataStr);
          }
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      onError(error.message);
    } else {
      onError("An unknown error occurred");
    }
  }
}
