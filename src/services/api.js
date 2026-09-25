const API_URL = "/api";

const request = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        message: text || "Invalid server response",
      };
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Request timed out. Please check that the backend is running."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Check that the required services are running."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const signup = async (userData) =>
  request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const login = async (credentials) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const getProfile = async (token) =>
  request("/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getTasks = async (token) =>
  request("/tasks", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const createTask = async (token, taskData) =>
  request("/tasks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

export const updateTask = async (token, taskId, taskData) =>
  request(`/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

export const deleteTask = async (token, taskId) =>
  request(`/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateProfile = async (token, userData) =>
  request("/users/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

export const getTeams = async (token) =>
  request("/teams", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const createTeam = async (token, teamData) =>
  request("/teams", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(teamData),
  });

export const getTeamMembers = async (token, teamId) =>
  request(`/teams/${teamId}/members`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const createInvitation = async (token, teamId, invitationData) =>
  request(`/teams/${teamId}/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(invitationData),
  });

export const getInvitation = async (token, invitationToken) =>
  request(`/invitations/${invitationToken}`, {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

export const acceptInvitation = async (token, invitationToken) =>
  request(`/invitations/${invitationToken}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });