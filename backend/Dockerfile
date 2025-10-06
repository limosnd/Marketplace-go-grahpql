# Etapa 1: Compilar la app Go
FROM golang:1.24 AS builder

WORKDIR /app

# Copiar dependencias y descargar módulos
COPY go.mod go.sum ./
RUN go mod download

# Copiar el resto del código
COPY . .

# Compilar el binario
RUN go build -o server ./cmd/server

# Etapa 2: Ejecutar la app
FROM gcr.io/distroless/base-debian12

WORKDIR /app

COPY --from=builder /app/server .
COPY gqlgen.yml .
COPY schemas ./schemas

EXPOSE 8080

CMD ["./server"]
