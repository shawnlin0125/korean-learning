{{/*
Expand the name of the chart.
*/}}
{{- define "korean-learning.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "korean-learning.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "korean-learning.labels" -}}
helm.sh/chart: {{ include "korean-learning.name" . }}-{{ .Chart.Version | replace "+" "_" }}
{{ include "korean-learning.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "korean-learning.selectorLabels" -}}
app.kubernetes.io/name: {{ include "korean-learning.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Construct DATABASE_URL from postgres values
*/}}
{{- define "korean-learning.databaseUrl" -}}
{{- printf "postgresql://%s:%s@postgres.%s.svc.cluster.local:5432/%s" .Values.postgres.user .Values.postgres.password .Values.namespace .Values.postgres.database }}
{{- end }}
