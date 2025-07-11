#!/bin/bash

# FinanceHub Monitoring Stack Startup Script
set -e

echo "🚀 Starting FinanceHub Monitoring Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create monitoring directories if they don't exist
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/rules

# Create Grafana datasource configuration
cat > monitoring/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true

  - name: Alertmanager
    type: alertmanager
    access: proxy
    url: http://alertmanager:9093
    editable: true
EOF

# Create Grafana dashboard provisioning
cat > monitoring/grafana/provisioning/dashboards/dashboard.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Download or create basic FinanceHub dashboard
cat > monitoring/grafana/dashboards/financehub-overview.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "FinanceHub Overview",
    "tags": ["financehub"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"financehub-backend\"}[5m])",
            "legendFormat": "{{method}} {{handler}}"
          }
        ],
        "xAxis": {"show": true},
        "yAxes": [{"label": "requests/sec", "show": true}],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"financehub-backend\"}[5m]))",
            "legendFormat": "95th percentile"
          }
        ],
        "yAxes": [{"label": "seconds", "show": true}],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "5s"
  }
}
EOF

echo "📊 Starting monitoring services..."

# Start the monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

services=("prometheus:9090" "grafana:3000" "alertmanager:9093")
for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s "http://localhost:$port" > /dev/null; then
        echo "✅ $name is running on port $port"
    else
        echo "❌ $name failed to start on port $port"
    fi
done

echo ""
echo "🎉 FinanceHub Monitoring Stack is ready!"
echo ""
echo "📊 Access URLs:"
echo "   Grafana:      http://localhost:3000 (admin/admin123)"
echo "   Prometheus:   http://localhost:9090"
echo "   Alertmanager: http://localhost:9093"
echo ""
echo "📈 To view logs: docker-compose -f docker-compose.monitoring.yml logs -f"
echo "🛑 To stop:      docker-compose -f docker-compose.monitoring.yml down" 