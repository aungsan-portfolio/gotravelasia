import { EXPLORE_CITIES } from "../data";
import { toSlug } from "../utils";
import FooterColumn from "../ui/FooterColumn";
import FooterLink from "../ui/FooterLink";

export default function ExploreColumn() {
    return (
        <FooterColumn title="Explore">
            {EXPLORE_CITIES.map((city) => (
                <FooterLink key={city.code} href={`/flights/to/${toSlug(city.name)}`}>
                    Flights to {city.name}
                </FooterLink>
            ))}
        </FooterColumn>
    );
}
