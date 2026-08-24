let wydatki = [];

try {
    wydatki = JSON.parse(localStorage.getItem("wydatki")) || [];

    if (!Array.isArray(wydatki)) {
        wydatki = [];
    }
} catch (error) {
    wydatki = [];
}

let edytowaneId = null;

document
    .getElementById("formularzWydateku")
    .addEventListener("submit", walidacja);

document
    .getElementById("dodajWydatek")
    .addEventListener("click", otworzModalDodawania);

document
    .getElementById("anulujWydatek")
    .addEventListener("click", zamknijModal);

document
    .getElementById("filtrKategoria")
    .addEventListener("change", render);

document
    .getElementById("filtrMiesiac")
    .addEventListener("change", render);

document
    .getElementById("sortowanie")
    .addEventListener("change", render);

document
    .getElementById("usunWszystkie")
    .addEventListener("click", usunWszystkie);

document
    .getElementById("wyszukiwarka")
    .addEventListener("input", render);

function otworzModalDodawania() {
    edytowaneId = null;

    document
        .getElementById("formularzWydateku")
        .reset();

    document
        .getElementById("modalTytul")
        .textContent = "Dodaj wydatek";

    document.querySelector(
        "#formularzWydateku button[type='submit']"
    ).textContent = "Dodaj";

    document
        .getElementById("modalWydatek")
        .showModal();
}

function zamknijModal() {
    document
        .getElementById("modalWydatek")
        .close();
}

function walidacja(event) {
    event.preventDefault();

    let nazwa = document
        .getElementById("nazwa")
        .value
        .trim();

    let kwota_wartosc = document
        .getElementById("kwota")
        .value;

    let kwota = Number(kwota_wartosc);

    let kategoria = document
        .getElementById("kategoria")
        .value;

    let data = document
        .getElementById("data")
        .value;

    if (nazwa === "") {
        alert("Podaj nazwę");
        return;
    }

    if (kwota_wartosc === "") {
        alert("Podaj kwotę");
        return;
    }

    if (kwota <= 0) {
        alert("Kwota musi być większa od 0");
        return;
    }

    if (kategoria === "") {
        alert("Wybierz kategorię");
        return;
    }

    if (data === "") {
        alert("Podaj datę");
        return;
    }

    if (edytowaneId !== null) {

        for (let i = 0; i < wydatki.length; i++) {

            if (wydatki[i].id === edytowaneId) {

                wydatki[i].nazwa = nazwa;
                wydatki[i].kwota = kwota;
                wydatki[i].kategoria = kategoria;
                wydatki[i].data = data;

                break;
            }
        }

        edytowaneId = null;

    } else {

        let nowyWydatek = {
            id: Date.now(),
            nazwa: nazwa,
            kwota: kwota,
            kategoria: kategoria,
            data: data
        };

        wydatki.push(nowyWydatek);
    }

    zapiszWydatki();

    document
        .getElementById("formularzWydateku")
        .reset();

    render();

    zamknijModal();
}

function zapiszWydatki() {
    localStorage.setItem(
        "wydatki",
        JSON.stringify(wydatki)
    );
}

function render() {

    let katFiltru = document
        .getElementById("filtrKategoria")
        .value;

    let miesiacFiltru = document
        .getElementById("filtrMiesiac")
        .value;

    let typSortowania = document
        .getElementById("sortowanie")
        .value;

    let wyszukiwanaFraza = document
        .getElementById("wyszukiwarka")
        .value
        .toLowerCase();

    let widoczneWydatki = [];

    for (let i = 0; i < wydatki.length; i++) {

        let w = wydatki[i];

        let pasujeKategoria =
            katFiltru === "wszystkie" ||
            w.kategoria.toLowerCase() === katFiltru.toLowerCase();

        let pasujeMiesiac =
            miesiacFiltru === "" ||
            w.data.startsWith(miesiacFiltru);

        let pasujeNazwa =
            w.nazwa.toLowerCase().includes(wyszukiwanaFraza);

        if (
            pasujeKategoria &&
            pasujeMiesiac &&
            pasujeNazwa
        ) {
            widoczneWydatki.push(w);
        }
    }

    widoczneWydatki.sort(function (a, b) {

        if (typSortowania === "najnowsze") {
            return new Date(b.data) - new Date(a.data);
        }

        if (typSortowania === "najstarsze") {
            return new Date(a.data) - new Date(b.data);
        }

        if (typSortowania === "najdrozsze") {
            return b.kwota - a.kwota;
        }

        if (typSortowania === "najtansze") {
            return a.kwota - b.kwota;
        }
    });

    let listaEl = document.getElementById("lista");

    listaEl.innerHTML = "";

    for (let i = 0; i < widoczneWydatki.length; i++) {

        let w = widoczneWydatki[i];

        let tr = document.createElement("tr");

        let tdNazwa = document.createElement("td");
        tdNazwa.textContent = w.nazwa;

        let tdKwota = document.createElement("td");
        tdKwota.textContent =
            w.kwota.toFixed(2) + " zł";

        let tdKategoria = document.createElement("td");
        tdKategoria.textContent = w.kategoria;

        let tdData = document.createElement("td");
        tdData.textContent = w.data;

        let tdAkcje = document.createElement("td");

        let divAkcje = document.createElement("div");
        divAkcje.className = "flex gap-1";

        let przyciskEdytuj =
            document.createElement("button");

        przyciskEdytuj.type = "button";
        przyciskEdytuj.textContent = "Edytuj";
        przyciskEdytuj.className =
            "btn btn-sm btn-outline btn-info";

        przyciskEdytuj.addEventListener(
            "click",
            function () {
                edytujWydatek(w.id);
            }
        );

        let przyciskUsun =
            document.createElement("button");

        przyciskUsun.type = "button";
        przyciskUsun.textContent = "Usuń";
        przyciskUsun.className =
            "btn btn-sm btn-outline btn-error";

        przyciskUsun.addEventListener(
            "click",
            function () {
                usunWydatek(w.id);
            }
        );

        divAkcje.appendChild(przyciskEdytuj);
        divAkcje.appendChild(przyciskUsun);

        tdAkcje.appendChild(divAkcje);

        tr.appendChild(tdNazwa);
        tr.appendChild(tdKwota);
        tr.appendChild(tdKategoria);
        tr.appendChild(tdData);
        tr.appendChild(tdAkcje);

        listaEl.appendChild(tr);
    }

    let suma = 0;

    for (let i = 0; i < wydatki.length; i++) {
        suma += wydatki[i].kwota;
    }

    document.getElementById("suma").textContent =
        suma.toFixed(2);

    document.getElementById("liczbaWydatkow").textContent =
        wydatki.length;

    renderKategorie();
}

function renderKategorie() {

    let podsumowanie = {
        jedzenie: 0,
        transport: 0,
        rozrywka: 0,
        zakupy: 0,
        rachunki: 0,
        inne: 0
    };

    for (let i = 0; i < wydatki.length; i++) {

        let kategoria = wydatki[i].kategoria;
        let kwota = wydatki[i].kwota;

        if (podsumowanie[kategoria] !== undefined) {
            podsumowanie[kategoria] += kwota;
        }
    }

    let nazwyKategorii = {
        jedzenie: "Jedzenie",
        transport: "Transport",
        rozrywka: "Rozrywka",
        zakupy: "Zakupy",
        rachunki: "Rachunki",
        inne: "Inne"
    };

    let listaKategorii =
        document.getElementById(
            "podsumowanieKategorii"
        );

    listaKategorii.innerHTML = "";

    for (let kategoria in podsumowanie) {

        let li = document.createElement("li");

        li.className =
            "flex justify-between rounded-lg bg-base-200 p-3";

        li.textContent =
            nazwyKategorii[kategoria] +
            " - " +
            podsumowanie[kategoria].toFixed(2) +
            " zł";

        listaKategorii.appendChild(li);
    }
}

function edytujWydatek(id) {

    for (let i = 0; i < wydatki.length; i++) {

        if (wydatki[i].id === id) {

            document.getElementById("nazwa").value =
                wydatki[i].nazwa;

            document.getElementById("kwota").value =
                wydatki[i].kwota;

            document.getElementById("kategoria").value =
                wydatki[i].kategoria;

            document.getElementById("data").value =
                wydatki[i].data;

            edytowaneId = id;

            document
                .getElementById("modalTytul")
                .textContent = "Edytuj wydatek";

            document.querySelector(
                "#formularzWydateku button[type='submit']"
            ).textContent = "Zapisz zmiany";

            document
                .getElementById("modalWydatek")
                .showModal();

            break;
        }
    }
}

function usunWydatek(id) {

    let nowaLista = [];

    for (let i = 0; i < wydatki.length; i++) {

        if (wydatki[i].id !== id) {
            nowaLista.push(wydatki[i]);
        }
    }

    wydatki = nowaLista;

    zapiszWydatki();

    render();
}

function usunWszystkie() {

    if (wydatki.length === 0) {
        alert("Nie ma żadnych wydatków do usunięcia.");
        return;
    }

    let potwierdzenie = confirm(
        "Czy na pewno chcesz usunąć wszystkie wydatki?"
    );

    if (potwierdzenie) {

        wydatki = [];

        edytowaneId = null;

        zapiszWydatki();

        zamknijModal();

        render();
    }
}

render();