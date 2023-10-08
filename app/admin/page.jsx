"use client";
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSpinner from '../utils/useSpinner'
import { auth, fs, storage } from '../config'
import { Products2 } from '../utils/Products2';

export default function Admin() {
    const router = useRouter()

    const [loader, showLoader, hideLoader] = useSpinner();
    const [searchterm, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    function GetUserUid() {

        const [uid, setUid] = useState(null);
        useEffect(() => {
            showLoader();
            auth.onAuthStateChanged(user => {
                if (user) {
                    setUid(user.uid);
                    const docRef = fs.collection('Admin').doc(user.uid)
                    docRef.get().then((doc) => {
                        if (doc.exists) {
                            console.log('success')
                            hideLoader();
                        } else {
                            console.log('not user')
                            router.push('/');
                            hideLoader();
                        }
                    })
                } else {
                    console.log('not user')
                    router.push('/');
                    hideLoader();
                }
            })
        }, [])
        return uid;
    }
    const uid = GetUserUid();

    const getProducts = async () => {
        const products = await fs.collection('ndocs').where('approved', '==', false).get();
        const productsArray = [];
        for (var snap of products.docs) {
            var data = snap.data();
            data.ID = snap.id;
            productsArray.push({
                ...data
            });
        }
        setProducts(productsArray);
    };

    useEffect(() => {
        getProducts();
    }, []);

    const handleSearch = async () => {
        const lowerSearchTerm = searchterm.toLowerCase();
        const querySnapshot = await fs.collection('ndocs').get();
    
        const searchResults = querySnapshot.docs
            .map((doc) => {
                const data = doc.data();
                data.ID = doc.id;
                return {
                    ...data,
                    title: data.title.toLowerCase(),
                };
            })
            .filter((product) => product.title.includes(lowerSearchTerm) && !product.approved);
    
        setProducts(searchResults);
        setCurrentPage(1);
    };
    

    // Calculate the range of items to display based on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const addToCart = (product) => {
        // Implement your cart logic here
    };
    return (
        <main>
            <div className="m-5" >
                <h1> ADMIN PANEL</h1>
                <Link href="/admin/upload">
                    <button className="w-48 md:w-64 text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2">
                        Upload
                    </button>
                </Link>
                <Link href="/admin/manage">
                    <button className="w-48 md:w-64 text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2">
                        Manage
                    </button>
                </Link>
                <div className="mb-3 ml-5 mr-5 ">
                    <div className="relative mb-4 flex w-full flex-wrap items-stretch">
                        <input
                            type="search"
                            className="relative m-0 -mr-0.5 block w-[1px] min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                            placeholder="Search"
                            aria-label="Search"
                            aria-describedby="button-addon1"
                            onChange={(e) => setSearch(e.target.value)} value={searchterm}
                        />

                        <button
                            className="relative z-[2] flex items-center rounded-r bg-primary px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg"
                            type="button"
                            id="button-addon1"
                            data-te-ripple-init
                            data-te-ripple-color="light"
                            onClick={handleSearch}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-5 w-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <Products2 products={products} addToCart={addToCart} />

                <div className="pagination pagination flex justify-center mb-4">
                    <button
                        className="btn btn-outline"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous Page
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastItem >= products.length}
                    >
                        Next Page
                    </button>
                </div>
            </div>
        </main>
    )
}
