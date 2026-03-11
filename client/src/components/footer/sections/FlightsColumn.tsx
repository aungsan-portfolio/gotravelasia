import FooterColumn from "../ui/FooterColumn";
import FooterLink from "../ui/FooterLink";

type FlightsColumnProps = {
    goToFlights: () => void;
    onBusinessClass: () => void;
};

export default function FlightsColumn({
    goToFlights,
    onBusinessClass,
}: FlightsColumnProps) {
    return (
        <FooterColumn title="Flights">
            <FooterLink
                href="/#flights"
                onClick={(e) => {
                    e.preventDefault();
                    goToFlights();
                }}
            >
                Cheap flights
            </FooterLink>

            <FooterLink
                href="/#flights"
                onClick={(e) => {
                    e.preventDefault();
                    goToFlights();
                }}
            >
                Last minute flights{" "}
                <span className="text-[9px] font-bold bg-[#ff4444] text-white px-1.5 py-0.5 rounded ml-1 uppercase">
                    HOT
                </span>
            </FooterLink>

            <FooterLink
                href="/#flights"
                onClick={(e) => {
                    e.preventDefault();
                    onBusinessClass();
                }}
            >
                Business class
            </FooterLink>

            <FooterLink
                href="/#flights"
                onClick={(e) => {
                    e.preventDefault();
                    goToFlights();
                }}
            >
                Direct flights
            </FooterLink>

            <FooterLink
                href="/#flights"
                onClick={(e) => {
                    e.preventDefault();
                    goToFlights();
                }}
            >
                Weekend getaways
            </FooterLink>

            <FooterLink
                href="/#flights"
                onClick={(e) => {
                    e.preventDefault();
                    goToFlights();
                }}
            >
                Flight deals{" "}
                <span className="text-[9px] font-bold bg-[#FFD700] text-[#2a0050] px-1.5 py-0.5 rounded ml-1 uppercase">
                    NEW
                </span>
            </FooterLink>
        </FooterColumn>
    );
}
