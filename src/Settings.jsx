import { useState } from "react";

import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Camera,
  Lock,
  LogOut,
  Check,
} from "lucide-react";

export default function Settings({
  profile,
  setProfile,
  preferences,
  setPreferences,
  onLogout,
}) {
  const [tab, setTab] = useState("Profile");
  const [saved, setSaved] = useState(false);

  const [passwords, setPasswords] =
    useState({
      current: "",
      newPassword: "",
      confirm: "",
    });

  const [message, setMessage] = useState("");

  const initials = profile.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const updateProfile = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggle = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const save = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const changePassword = (e) => {
    e.preventDefault();

    if (
      !passwords.current ||
      !passwords.newPassword ||
      !passwords.confirm
    ) {
      setMessage("Please fill all fields.");
      return;
    }

    if (
      passwords.newPassword !==
      passwords.confirm
    ) {
      setMessage("Passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setMessage("Password changed successfully.");

    setPasswords({
      current: "",
      newPassword: "",
      confirm: "",
    });
  };

  const tabs = [
    ["Profile", User],
    ["Notifications", Bell],
    ["Appearance", Palette],
    ["Security", Shield],
  ];

  return (
    <div className="settings-page">
      <div className="page-heading">
        <div>
          <p className="greeting">
            Account preferences
          </p>

          <h1>Settings</h1>

          <p>
            Manage your profile and TaskFlow preferences.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="settings-profile-mini">
            <div className="settings-avatar">
              {initials}
            </div>

            <div>
              <strong>{profile.name}</strong>
              <span>{profile.role}</span>
            </div>
          </div>

          <div className="settings-tabs">
            {tabs.map(([name, Icon]) => (
              <button
                key={name}
                className={
                  tab === name ? "active" : ""
                }
                onClick={() => setTab(name)}
              >
                <Icon size={18} />
                {name}
              </button>
            ))}
          </div>

          <button
            className="settings-logout"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <section className="settings-content">
          {tab === "Profile" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Profile Information</h2>
                  <p>
                    Update your personal information.
                  </p>
                </div>
              </div>

              <div className="profile-cover">
                <div className="large-avatar">
                  {initials}
                </div>

                <button className="avatar-camera">
                  <Camera size={15} />
                </button>
              </div>

              <div className="profile-form">
                <div className="form-two">
                  <div className="form-group">
                    <label>Full Name</label>

                    <input
                      value={profile.name}
                      onChange={(e) =>
                        updateProfile(
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>

                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        updateProfile(
                          "email",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="form-two">
                  <div className="form-group">
                    <label>Role</label>

                    <input
                      value={profile.role}
                      onChange={(e) =>
                        updateProfile(
                          "role",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>

                    <input
                      value={profile.location}
                      onChange={(e) =>
                        updateProfile(
                          "location",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio</label>

                  <textarea
                    rows="5"
                    value={profile.bio}
                    onChange={(e) =>
                      updateProfile(
                        "bio",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="settings-save-row">
                  <span className="save-success">
                    {saved && (
                      <>
                        <Check size={15} />
                        Changes saved
                      </>
                    )}
                  </span>

                  <button
                    className="btn-primary"
                    onClick={save}
                  >
                    <Save size={17} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "Notifications" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>
                    Notification Settings
                  </h2>

                  <p>
                    Choose which notifications you
                    want to receive.
                  </p>
                </div>
              </div>

              <div className="settings-options">
                {[
                  [
                    "Email Notifications",
                    "Receive important account updates.",
                    "emailNotifications",
                    Bell,
                    "blue",
                  ],
                  [
                    "Task Reminders",
                    "Get reminders about upcoming tasks.",
                    "taskReminders",
                    Bell,
                    "orange",
                  ],
                  [
                    "Completion Alerts",
                    "Get notified when tasks are completed.",
                    "completionAlerts",
                    Check,
                    "green",
                  ],
                ].map(
                  ([
                    title,
                    description,
                    field,
                    Icon,
                    color,
                  ]) => (
                    <div
                      className="setting-option"
                      key={field}
                    >
                      <div
                        className={`setting-option-icon ${color}`}
                      >
                        <Icon size={19} />
                      </div>

                      <div className="setting-option-info">
                        <strong>{title}</strong>
                        <p>{description}</p>
                      </div>

                      <button
                        className={`toggle ${
                          preferences[field]
                            ? "on"
                            : ""
                        }`}
                        onClick={() =>
                          toggle(field)
                        }
                      >
                        <span />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {tab === "Appearance" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Appearance</h2>
                  <p>
                    Customize how TaskFlow looks.
                  </p>
                </div>
              </div>

              <div className="appearance-section">
                <h3>Theme</h3>

                <p>
                  Choose your preferred interface
                  appearance.
                </p>

                <div className="theme-options">
                  <button
                    className={`theme-option ${
                      !preferences.darkMode
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setPreferences((p) => ({
                        ...p,
                        darkMode: false,
                      }))
                    }
                  >
                    <div className="theme-preview light-preview">
                      <div />
                      <div />
                    </div>

                    <strong>Light</strong>

                    {!preferences.darkMode && (
                      <Check
                        className="theme-check"
                        size={16}
                      />
                    )}
                  </button>

                  <button
                    className={`theme-option ${
                      preferences.darkMode
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setPreferences((p) => ({
                        ...p,
                        darkMode: true,
                      }))
                    }
                  >
                    <div className="theme-preview dark-preview">
                      <div />
                      <div />
                    </div>

                    <strong>Dark</strong>

                    {preferences.darkMode && (
                      <Check
                        className="theme-check"
                        size={16}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "Security" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Security</h2>
                  <p>
                    Manage your account security.
                  </p>
                </div>
              </div>

              <div className="security-section">
                <div className="security-heading">
                  <div className="setting-option-icon blue">
                    <Lock size={19} />
                  </div>

                  <div>
                    <h3>Change Password</h3>

                    <p>
                      Keep your account secure.
                    </p>
                  </div>
                </div>

                <form onSubmit={changePassword}>
                  <div className="form-group">
                    <label>Current Password</label>

                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords((p) => ({
                          ...p,
                          current:
                            e.target.value,
                        }))
                      }
                      placeholder="Current password"
                    />
                  </div>

                  <div className="form-two">
                    <div className="form-group">
                      <label>New Password</label>

                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            newPassword:
                              e.target.value,
                          }))
                        }
                        placeholder="New password"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Confirm Password
                      </label>

                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            confirm:
                              e.target.value,
                          }))
                        }
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  {message && (
                    <div className="password-message">
                      {message}
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    type="submit"
                  >
                    <Lock size={17} />
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}