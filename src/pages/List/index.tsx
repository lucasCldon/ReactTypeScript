import React, {useMemo, useState, useEffect} from "react";
import {uuid} from "uuidv4";
import ContentHeader from "../../components/ContentHeader";
import SelectInput from "../../components/SelectInput";
import HistoryFinanceCard from "../../components/HistoryFinanceCard";

import gains from "../../repositories/gains";
import expenses from "../../repositories/expenses";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import listOfmonths from "../../utils/months";

import {Container, Content, Filters} from "./styles";

interface IData {
    id: string;
    description: string;
    amountFormatted: string;
    frequency: string;
    dateFormatted: string;
    tagColor: string;
}

interface IRouteParams {
    match: {
        params: {
            type: string;
        }
    }
}

const List: React.FC<IRouteParams> = ({match}) => {
    const [data, setData] = useState<IData[]>([]);
    const [monthSelected, setMonthSelected] = useState<string>(String(new Date().getMonth() + 1));
    const [yearSelected, setYearSelected] = useState<string>(String(new Date().getFullYear()));
    const [frequencyFilterSelected, setFrequencyFilterSelected] = useState(["recorrente", "eventual"]);
    const movimentType = match.params.type;
    const title = useMemo(() => {
        return movimentType === "entry-balance" ? "Entradas" : "Saídas"
    }, [movimentType]);
    const lineColor = useMemo(() => {
        return movimentType === "entry-balance" ? "#f7931b" : "#e44c4e"
    }, [movimentType]);

    const listData = useMemo(() => {
        return movimentType === "entry-balance" ? gains : expenses;
    }, [movimentType]);

    const months = useMemo(() => {
        return listOfmonths.map((month, index) => {
            return {
                value: index + 1,
                lable: month,
            }
        })
    }, []);


    const years = useMemo(() => {
        let uniqueYears: number[] = [];

        listData.forEach(item => {
            const date = new Date(item.date);
            const year = date.getFullYear();

            if (!uniqueYears.includes(year)) {
                uniqueYears.push(year)
            }
        });
        return uniqueYears.map(year => {
            return {
                value: year,
                lable: year,
            }
        });
    }, [listData]);

    const handleFrequencyClick = (frequency: string) => {
        const alreadySelected = frequencyFilterSelected.findIndex(item => item === frequency);

        if (alreadySelected >= 0) {
            const filtered= frequencyFilterSelected.filter(item=>item!= frequency);
            setFrequencyFilterSelected(filtered);
        } else {
            setFrequencyFilterSelected((prev)=>[...prev, frequency]);
        }
    }

    useEffect(() => {
        const filteredData = listData.filter(item => {
            const date = new Date(item.date);
            const month = String(date.getMonth() + 1);
            const year = String(date.getFullYear());

            return month === monthSelected && year === yearSelected && frequencyFilterSelected.includes(item.frequency);
        });

        const formattedData = filteredData.map(item => {
            return {
                id: uuid(),
                description: item.description,
                amountFormatted: formatCurrency(Number(item.amount)),
                frequency: item.frequency,
                dateFormatted: formatDate(item.date),
                tagColor: item.frequency === "recorrente" ? "#4e41f0" : "#e44c4e",
            }
        });

        setData(formattedData);
    }, [listData, monthSelected, yearSelected, data.length, frequencyFilterSelected]);

    return (
        <Container>
            <ContentHeader title={title} lineColor={lineColor}>
                <SelectInput options={months} onChange={(e) =>
                    setMonthSelected(e.target.value)} defaultValue={monthSelected}/>
                <SelectInput options={years} onChange={(e) =>
                    setYearSelected(e.target.value)} defaultValue={yearSelected}/>
            </ContentHeader>

            <Filters>
                <button type="button"
                        className={`tag-filter tag-filter-recurrent
                        ${frequencyFilterSelected.includes("recorrente")&& "tag-actived"}`}
                        onClick={() => handleFrequencyClick("recorrente")}
                >
                    Recorrentes
                </button>
                <button type="button"
                        className={`tag-filter tag-filter-eventual
                        ${frequencyFilterSelected.includes("eventual")&& "tag-actived"}`}

                        onClick={() => handleFrequencyClick("eventual")}
                >
                    Eventuais
                </button>
            </Filters>
            <Content>
                {
                    data.map(item => (
                            < HistoryFinanceCard
                                key={item.id}
                                tagColor={item.tagColor}
                                title={item.description}
                                subtitle={item.dateFormatted}
                                amount={item.amountFormatted}
                            />
                        )
                    )
                }
            </Content>
        </Container>
    );
}

export default List;