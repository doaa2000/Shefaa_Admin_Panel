/**
 * A tiny, type-safe dependency-injection container. Implements the Dependency
 * Inversion Principle: high-level modules (services, stores) resolve abstractions
 * by token without knowing which concrete implementation is bound.
 */

/** A unique, type-carrying token. The phantom generic preserves the bound type. */
export interface Token<T> {
  readonly key: symbol;
  /** phantom — never assigned at runtime */
  readonly _type?: T;
}

export function createToken<T>(description: string): Token<T> {
  return { key: Symbol(description) };
}

type Factory<T> = (c: Container) => T;

export class Container {
  private factories = new Map<symbol, Factory<unknown>>();
  private singletons = new Map<symbol, unknown>();

  /** Register a lazily-instantiated singleton factory for a token. */
  register<T>(token: Token<T>, factory: Factory<T>): void {
    this.factories.set(token.key, factory as Factory<unknown>);
  }

  /** Register an already-constructed value. */
  registerValue<T>(token: Token<T>, value: T): void {
    this.singletons.set(token.key, value);
  }

  /** Resolve a token, constructing (and caching) the singleton on first use. */
  resolve<T>(token: Token<T>): T {
    if (this.singletons.has(token.key)) {
      return this.singletons.get(token.key) as T;
    }
    const factory = this.factories.get(token.key);
    if (!factory) {
      throw new Error(`No provider registered for token "${token.key.description}"`);
    }
    const value = factory(this);
    this.singletons.set(token.key, value);
    return value as T;
  }

  has(token: Token<unknown>): boolean {
    return this.factories.has(token.key) || this.singletons.has(token.key);
  }
}

/** The application-wide container instance. */
export const container = new Container();
