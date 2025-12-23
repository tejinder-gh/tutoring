import { render, screen } from "@testing-library/react";
import { User } from "lucide-react";
import StatCard from "../StatCard";

describe("StatCard", () => {
  it("renders title and value correctly", () => {
    render(<StatCard title="Total Users" value="100" icon={User} />);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders subtext when provided", () => {
    render(
      <StatCard
        title="Revenue"
        value="$500"
        icon={User}
        subtext="+5% from last month"
      />
    );

    expect(screen.getByText("+5% from last month")).toBeInTheDocument();
  });
});
