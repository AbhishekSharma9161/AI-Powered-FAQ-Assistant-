const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchConversations(search = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations?search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function fetchConversationDetails(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch conversation details');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function createConversation(title = 'New Conversation') {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function sendMessage(id, message) {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to send message');
    }
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function deleteConversation(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
