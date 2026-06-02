# EncuestasTdea

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.9.

Frontend en **Angular** + backend en **Firebase Functions** (Firestore como base de datos).

## Configuración inicial (credenciales de Firebase)

> ⚠️ **La clave de cuenta de servicio del Admin SDK NO se incluye en el repositorio** por seguridad (está ignorada en `.gitignore` mediante la regla `*-adminsdk-*.json`). Esa clave da acceso administrativo total al proyecto Firebase, por lo que cada desarrollador debe generar la suya.

Algunos scripts de backend (`functions/src/seed.ts` y `functions/src/seed-admin.ts`) requieren esta clave para conectarse a Firestore con privilegios de administrador. Para configurarla:

1. Entra a la [Firebase Console](https://console.firebase.google.com/) → ⚙️ **Configuración del proyecto** → pestaña **Cuentas de servicio**.
2. Pulsa **Generar nueva clave privada** y descarga el archivo `.json`.
3. Colócalo dentro de la carpeta `functions/` con el nombre exacto que esperan los scripts:

   ```
   functions/encuestatdea-baeff-firebase-adminsdk-fbsvc-11c5af7468.json
   ```

   > El nombre del archivo está referenciado de forma fija en los imports de los scripts seed. Si usas otro nombre, actualiza esos imports.

4. Verifica que el archivo queda ignorado por git:

   ```bash
   git check-ignore functions/encuestatdea-baeff-firebase-adminsdk-fbsvc-11c5af7468.json
   ```

   Si la ruta aparece en la salida, está correctamente ignorada y **nunca** se subirá al repositorio.

En producción (Firebase Functions desplegadas) **no hace falta este archivo**: las credenciales las inyecta Firebase automáticamente.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
