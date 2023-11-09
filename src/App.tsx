import {debounce, map}                      from 'lodash';
import React, {useEffect, useRef, useState} from 'react';

function App() {
    const [data, setData] = useState<any>([])

    // We don't even need Ref here, maybe just a `let` is enough
    const timer = useRef<any>()

    // Simple fetch function to async gets data from a dummy online RestAPI source
    const fetchData = async (skip = data.length || 0) => {
        return fetch(`https://dummyjson.com/products?limit=8&skip=${skip}`)
    }

    // One-time run to fetch data initially and setup timer to run every 60s
    useEffect(() => {
        if (data.length < 1) {
            fetchData()
                .then(async response => {
                    const tmp = await response.json()
                    setData(tmp['products'])

                    timer.current = setInterval(() => {
                        fetchData()
                            .then(async response => {
                                const tmp = await response.json()
                                if (data.length < 1) {
                                    setData(tmp['products'])
                                } else {
                                    setData([...data, ...tmp['products']])
                                }
                            })
                            .then(json => console.log(json))
                    }, 60000)
                })
                .then(json => console.log(json))
        }

        return () => {
            clearInterval(timer.current)
        }
    }, [])

    // Load more data when click
    const loadMore = () => {
        fetchData()
            .then(async response => {
                const tmp = await response.json()
                setData([...data, ...tmp['products']])
            })
            .then(json => console.log(json))
    }

    // Instant simple text search
    const onSearch = debounce((val: string) => {
        if (val.length >= 3) {
            const result = map(data, (i) => {
                const tmp = [i.title, i.description].join(' ').toLowerCase()
                if (!tmp.includes(val.toLowerCase())) {
                    return {
                        ...i,
                        hide: true,
                    }
                }
                return i
            })
            setData(result)
        } else if (val.length === 0) {
            const result = map(data, (i) => {
                i.hide = false
                return i
            })
            setData(result)
        }
    }, 500)

    // Instant simple filter
    const filterItems = debounce((val: string) => {
        switch (val) {
            case 'all': {
                const result = map(data, (i) => {
                    i.hide = false
                    return i
                })
                setData(result)
                break
            }
            case 'low': {
                const result = map(data, (i) => {
                    i.hide = i.stock > 40;
                    return i
                })
                setData(result)
                break
            }
            case 'high': {
                const result = map(data, (i) => {
                    i.hide = i.stock <= 40;
                    return i
                })
                setData(result)
                break
            }
        }
    }, 200)

    // This is a sample {} prototype
    /**
     * {
     *     "id": 11,
     *     "title": "perfume Oil",
     *     "description": "Mega Discount, Impression of Acqua Di Gio by GiorgioArmani concentrated attar perfume Oil",
     *     "price": 13,
     *     "discountPercentage": 8.4,
     *     "rating": 4.26,
     *     "stock": 65,
     *     "brand": "Impression of Acqua Di Gio",
     *     "category": "fragrances",
     *     "thumbnail": "https://i.dummyjson.com/data/products/11/thumbnail.jpg",
     *     "images": [
     *         "https://i.dummyjson.com/data/products/11/1.jpg",
     *         "https://i.dummyjson.com/data/products/11/2.jpg",
     *         "https://i.dummyjson.com/data/products/11/3.jpg",
     *         "https://i.dummyjson.com/data/products/11/thumbnail.jpg"
     *     ]
     * }
     */

    return (
        <div className="container-fluid">
            <header className="bg-amber-400">
                <div className="bg-amber-200">
                    <p className="text-xl h-[300px] flex justify-center items-center">
                        Header
                    </p>
                </div>
            </header>
            <main className="md:max-w-6xl md:mx-auto flex flex-col md:flex-row">
                <aside className="flex-initial md:w-1/4">
                    <div className="w-full p-2">
                        <div className="relative h-10 w-full min-w-[200px]">
                            <input
                                className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-green-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                placeholder=" "
                                type="text" onChange={(e) => {
                                onSearch(e.target.value)
                            }}
                            />
                            <label
                                className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-green-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-green-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-green-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                Enter &gt;=3 char to find
                            </label>
                        </div>
                    </div>
                    <div className="w-full p-2">
                        <div className="relative h-10 w-full min-w-[200px]">
                            <select onChange={(e) => {
                                filterItems(e.target.value)
                            }}
                                    className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 empty:!bg-red-500 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50">
                                <option value="all" selected>All</option>
                                <option value="low">low stock</option>
                                <option value="high">high stock</option>
                            </select>
                            <label
                                className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-pink-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-pink-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-pink-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                Stock filter
                            </label>
                        </div>
                    </div>
                </aside>
                <section className="flex-initial md:w-3/4">
                    <div className="grid grid-cols-4 gap-4">
                        {data.length && data.map((item: any) => {
                            if (!item.hide) {
                                return <div
                                    className={`border rounded-xl ${item.stock > 40 ? 'bg-green-400' : 'bg-red-400'} p-4`}>
                                    <figure>
                                        <img src={item.thumbnail} alt={item.title} className="h-[100px] object-fill"/>
                                    </figure>
                                    <p className="font-bold">{item.title}</p>
                                    <p>{item.brand}</p>
                                    <p className="text-xs">{item.description.substring(0, 100)}...</p>
                                </div>
                            }
                        })}
                    </div>
                    <div className="text-center font-bold hover:cursor-pointer py-4" onClick={loadMore}>
                        Load more...
                    </div>
                </section>
            </main>
            <div className="bg-amber-200">
                <p className="text-xl h-[300px] flex justify-center items-center">
                    Footer
                </p>
            </div>
        </div>
    );
}

export default App;
