import { PlusDivider, PlusFrame } from "./plus-frame";
import { SignInCard } from "./sign-in-card";
import { TrustStrip } from "./trust-strip";

export function LoginView() {
  return (
    <div className="w-full max-w-[440px]">
      <PlusFrame>
        <SignInCard />
        <PlusDivider />
        <TrustStrip />
      </PlusFrame>
    </div>
  );
}
