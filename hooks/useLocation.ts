import { Country, State, City } from 'country-state-city';

const useLocation = () => {
  // Получить информацию о стране по коду страны
  const getCountryByCode = (countryCode: string) => {
    return Country.getAllCountries().find(
      (country) => country.isoCode === countryCode
    );
  };

  // Получить информацию о штате по коду страны и коду штата
  const getStateByCode = (countryCode: string, stateCode: string) => {
    const state = State.getAllStates().find(
      (state) =>
        state.countryCode === countryCode && state.isoCode === stateCode
    );

    if (!state) return null;
    return state;
  };

  // Получить список всех штатов в стране по коду страны
  const getCountryStates = (countryCode: string) => {
    return State.getAllStates().filter(
      (state) => state.countryCode === countryCode
    );
  };

  // Получить список всех городов в штате по коду страны и коду штата
  const getStateCities = (countryCode: string, stateCode?: string) => {
    return City.getAllCities().filter(
      (city) => city.countryCode === countryCode && city.stateCode === stateCode
    );
  };

  return {
    getAllCountries: Country.getAllCountries,
    getCountryByCode,
    getStateByCode,
    getCountryStates,
    getStateCities,
  };
};

export default useLocation;
