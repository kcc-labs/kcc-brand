import type { Metadata } from "next";
import { ProposalDoc } from "@/components/ProposalDoc";

export const metadata: Metadata = { title: "Example: pilot proposal" };

export default function Proposal() {
  return <ProposalDoc />;
}
