import { Button, Loader, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

function AuthBoundary({ loading }: { loading: boolean }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: "translate(-50%, -50%)", left: "50%", top: "50%" }}>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Text size="md" className="text-center">
            You are not logged in.
            <br />
            Please select a user to login.
          </Text>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      )}
    </div>
  );
}

export default AuthBoundary;
