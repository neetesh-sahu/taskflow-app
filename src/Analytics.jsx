import {
  BarChart3,
  CheckCircle2,
  Clock3,
  ListTodo,
  TrendingUp,
} from "lucide-react";

export default function Analytics({ tasks = [] }) {
  const total = tasks.length;

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const completion =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  const values = [40, 65, 50, 82, 60, 78, 48];

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="greeting">
            Your productivity
          </p>

          <h1>Analytics</h1>

          <p>
            Understand your task progress and
            productivity.
          </p>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="analytics-icon blue">
            <ListTodo size={21} />
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{total}</strong>
            <small>
              Updated from your tasks
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-icon green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completed}</strong>
            <small>
              {completion}% completion rate
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-icon orange">
            <Clock3 size={21} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{inProgress}</strong>
            <small>
              Currently active
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-icon purple">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pending}</strong>
            <small>
              Tasks waiting
            </small>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3>Weekly Productivity</h3>
              <p>
                Your task activity over the week.
              </p>
            </div>

            <BarChart3 size={20} />
          </div>

          <div className="analytics-chart">
            {values.map((value, index) => (
              <div
                className="analytics-bar-column"
                key={index}
              >
                <div className="analytics-bar-wrap">
                  <div
                    className="analytics-bar"
                    style={{
                      height: `${value}%`,
                    }}
                  />
                </div>

                <span>
                  {
                    [
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ][index]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h3>Task Distribution</h3>
              <p>
                Current task status.
              </p>
            </div>
          </div>

          <div className="distribution">
            <div className="distribution-row">
              <span>
                <i className="dot blue-dot" />
                Completed
              </span>

              <strong>{completed}</strong>
            </div>

            <div className="distribution-row">
              <span>
                <i className="dot orange-dot" />
                In Progress
              </span>

              <strong>{inProgress}</strong>
            </div>

            <div className="distribution-row">
              <span>
                <i className="dot gray-dot" />
                Pending
              </span>

              <strong>{pending}</strong>
            </div>
          </div>

          <div className="analytics-progress">
            <div
              style={{
                width: `${completion}%`,
              }}
            />
          </div>

          <p className="progress-label">
            {completion}% of your tasks are
            completed.
          </p>
        </div>
      </div>
    </div>
  );
}