import { GenerationRequestParams, GenerationResult, generateWithGroq } from './groqService.ts';

export function getAdminAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('accs_admin_token') || localStorage.getItem('accs_token') || 'accs_sec_admin_fallback'
      : 'accs_sec_internal_token';

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Admin-Token': token,
  };
}

export async function requestAdminSessionToken(username: string, passcode: string): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/admin-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, passcode }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accs_admin_token', data.token);
          localStorage.setItem('accs_token', data.token);
        }
        return data.token;
      }
    }
  } catch (e) {
    console.warn('Could not exchange admin session token with server:', e);
  }
  return null;
}

export async function generateContent(params: GenerationRequestParams): Promise<GenerationResult> {
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      return data.data;
    }

    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Server generation error: ${res.statusText}`);
  } catch (err: any) {
    console.warn('API route failed or unreachable, executing resilient direct Groq engine fallback:', err);
    // Fallback to local Groq SDK / simulation caller
    return await generateWithGroq(params);
  }
}

export async function testToolGeneration(params: {
  toolId: string;
  params: Record<string, any>;
  mockFailure?: string;
  modelOverride?: string;
}): Promise<GenerationResult> {
  try {
    const res = await fetch('/api/ai/test-tool', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Tool test failed');
      (error as any).statusCode = res.status;
      throw error;
    }
    return data.data;
  } catch (err: any) {
    return await generateWithGroq({
      toolId: params.toolId,
      params: params.params,
      mockFailure: params.mockFailure,
      modelOverride: params.modelOverride,
    });
  }
}

export async function fetchAdminConfig() {
  try {
    const res = await fetch('/api/admin/config', {
      headers: getAdminAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch {
    // Fallback
  }
  return {
    activeModel: 'llama-3.3-70b-versatile',
    providerMode: 'simulation',
    apiKeyConfigured: false,
    emergencyKillSwitch: false,
  };
}

export async function updateAdminConfig(payload: {
  activeModel?: string;
  providerMode?: 'live' | 'simulation';
  emergencyKillSwitch?: boolean;
}) {
  const res = await fetch('/api/admin/config', {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Config update failed');
  }
  return (await res.json()).data;
}
