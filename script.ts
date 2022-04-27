interface ICar {
  name: string;
  plate: string;
  entry: Date;
}

interface IFinish {
  name: string;
  plate: string;
  time: number;
}

class ParkingFront {
  constructor(
    private $: (q: string) => HTMLInputElement,
    private parking = new Parking()
  ) {}

  addCar(car: ICar, save = false) {
    this.parking.addCar(car);

    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${car.name}</td>
                <td>${car.plate}</td>
                <td data-time="${car.entry}">
                    ${car.entry.toLocaleString("pt-BR", {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                </td>
                <td>
                    <button class="delete">x</button>
                </td>
            `;

    if (save) {
      this.parking.save();
    }

    this.$("#parkingLot").appendChild(row);
  }

  finish(cells: HTMLCollection) {
    if (cells[2] instanceof HTMLElement) {
      const car = {
        name: cells[0].textContent || "",
        plate: cells[1].textContent || "",
        time:
          new Date().valueOf() -
          new Date(cells[2].dataset.time as string).valueOf(),
      };

      this.parking.finish(car);
    }
  }

  render() {
    this.$("#parkingLot").innerHTML = "";
    this.parking.cars.forEach((c: ICar) => this.addCar(c));
  }
}

class Parking {
  public cars: ICar[];
  constructor() {
    this.cars = localStorage.cars ? JSON.parse(localStorage.cars) : [];
  }

  addCar(car: ICar) {
    this.cars.push(car);
  }

  finish(info: IFinish) {
    const time = this.calcTime(info.time);

    const msg = `
      O veículo ${info.name} de placa ${info.plate} permaneceu ${time} estacionado.
      \n\n Deseja encerrar?
    `;

    if (!confirm(msg)) return;

    this.cars = this.cars.filter((car) => car.plate !== info.plate);

    this.save();
  }

  private calcTime(mil: number) {
    var min = Math.floor(mil / 60000);
    var sec = Math.floor((mil % 60000) / 1000);
    return `${min}m e ${sec}s`;
  }

  save() {
    console.log("Salvando...");
    localStorage.cars = JSON.stringify(this.cars);
  }
}

(function () {
  const $ = (q: string) => {
    const elem = document.querySelector<HTMLInputElement>(q);

    if (!elem) throw new Error("Ocorreu um erro ao buscar o elemento.");

    return elem;
  };

  const parking = new ParkingFront($);
  parking.render();

  $("#insertButton").addEventListener("click", () => {
    const name = $("#name").value;
    const plate = $("#plate").value;

    if (!name || !plate) {
      alert("Os campos são obrigatórios.");
      return;
    }

    const car: ICar = { name, plate, entry: new Date() };

    parking.addCar(car, true);

    $("#name").value = "";
    $("#plate").value = "";
  });

  $("#parkingLot").addEventListener("click", ({ target }: MouseEvent | any) => {
    if (target.className === "delete") {
      parking.finish(target.parentElement.parentElement.cells);
      parking.render();
    }
  });
})();
