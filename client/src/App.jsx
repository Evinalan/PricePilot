import { useEffect, useState } from "react";
import API from "./services/api";

function App() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response =
                    await API.get("/products");

                setProducts(
                    response.data.products
                );

            } catch (error) {

                console.error(
                    "Failed to fetch products:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        fetchProducts();

    }, []);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    return (
        <div>

            <h1>PricePilot</h1>

            <h2>Products</h2>

            {products.map((product) => (

                <div key={product._id}>

                    <h3>
                        {product.name}
                    </h3>

                    <p>
                        Brand: {product.brand}
                    </p>

                    <p>
                        Category: {product.category}
                    </p>

                </div>

            ))}

        </div>
    );
}

export default App;