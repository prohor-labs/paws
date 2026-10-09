import { Spinner } from "@/components/ui/spinner";

export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner className="size-6 text-primary" />
    </div>
  );
}
