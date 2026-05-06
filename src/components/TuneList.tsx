import { CarFront, CopyPlus, Plus, Search } from "lucide-react";
import { APP_NAME } from "../config/domain";
import type { AppData, Tune } from "../types";

interface TuneListProps {
  data: AppData;
  activeTuneId: string;
  onSelect: (id: string) => void;
  onCreateTune: (carId: string) => void;
  onCreateCar: () => void;
  onCompare: () => void;
}

export function TuneList({ data, activeTuneId, onSelect, onCreateTune, onCreateCar, onCompare }: TuneListProps) {
  const tunesByCar = data.cars.map((car) => ({ car, tunes: data.tunes.filter((tune) => tune.carId === car.id) }));

  return (
    <aside className="garage">
      <div className="garageTop">
        <div>
          <p>{APP_NAME}</p>
          <h1>Setups</h1>
        </div>
        <button className="iconButton highContrast" type="button" onClick={onCreateCar} aria-label="Create car">
          <Plus size={22} />
        </button>
      </div>
      <button className="compareButton" type="button" onClick={onCompare}>
        <CopyPlus size={19} />
        Compare tunes
      </button>
      <label className="searchBox">
        <Search size={18} />
        <input placeholder="Search tunes, tags, track" />
      </label>
      <div className="carList">
        {tunesByCar.map(({ car, tunes }) => (
          <section className="carGroup" key={car.id}>
            <header>
              <CarFront size={20} />
              <div>
                <h2>{car.name}</h2>
                <span>{car.chassis}</span>
              </div>
              <button type="button" onClick={() => onCreateTune(car.id)} aria-label={`Create tune for ${car.name}`}>
                <Plus size={18} />
              </button>
            </header>
            {tunes.map((tune: Tune) => (
              <button className={`tuneRow ${activeTuneId === tune.id ? "active" : ""}`} key={tune.id} type="button" onClick={() => onSelect(tune.id)}>
                <strong>{tune.name}</strong>
                <span>{tune.track}</span>
                <em>{tune.tags.slice(0, 3).join(" / ")}</em>
              </button>
            ))}
          </section>
        ))}
      </div>
    </aside>
  );
}
