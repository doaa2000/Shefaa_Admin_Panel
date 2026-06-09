/**
 * Base contract for a use case (application command/query). Each use case has a
 * single responsibility and is invoked through its `execute` method.
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
