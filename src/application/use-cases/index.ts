/**
 * Use-case barrel. Use cases are thin, single-responsibility wrappers over the
 * application services. The doctors module is fully expanded as the reference
 * implementation; other modules follow the identical pattern and can be added
 * here as the product grows.
 */
export * from './UseCase';
export * from './doctors.usecases';
