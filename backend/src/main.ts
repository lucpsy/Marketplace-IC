import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json, NextFunction, Request, Response, urlencoded } from "express";
import { AppModule } from "./app.module";
import {
  getCorsOrigins,
  getDatabaseConfig,
  getJwtSecret,
  isProduction,
} from "./common/config/env.config";

async function bootstrap() {
  // Valida segredos e configurações críticas antes de subir o servidor
  getJwtSecret();
  getDatabaseConfig();
  const corsOrigins = getCorsOrigins();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.disable("x-powered-by");

  if (process.env.TRUST_PROXY === "true" || isProduction()) {
    expressApp.set("trust proxy", 1);
  }

  // Limite de payload para rotas JSON/form (uploads usam FileInterceptor próprio de 5 MB)
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true, limit: "1mb" }));

  // Headers de segurança HTTP (equivalente ao Helmet)
  const corpPolicy = process.env.CORP_POLICY?.trim() || "same-site";
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=()",
    );
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", corpPolicy);

    if (isProduction()) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
    }

    if (req.path.includes("/pedido/comprovantes/")) {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; img-src 'self' data:; object-src 'self'; style-src 'unsafe-inline'; script-src 'none'; frame-ancestors 'none'",
      );
    } else {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; frame-ancestors 'none'",
      );
    }

    next();
  });

  // Prefixo global das rotas
  app.setGlobalPrefix("api");

  // Validação automática dos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS restrito às origens configuradas por ambiente
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}

bootstrap();
