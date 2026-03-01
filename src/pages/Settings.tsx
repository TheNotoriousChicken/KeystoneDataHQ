import Card from "../components/ui/Card";

export default function Settings() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-text-main mb-8">Organization Settings</h1>

            <Card title="Workspace Profile" className="max-w-2xl">
                <form className="flex flex-col gap-6 mt-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="companyName" className="text-sm font-medium text-text-main">
                            Company Name
                        </label>
                        <input
                            id="companyName"
                            type="text"
                            defaultValue="NovaEdge IT Consulting"
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-main text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="domain" className="text-sm font-medium text-text-main">
                            Domain
                        </label>
                        <input
                            id="domain"
                            type="text"
                            defaultValue="novaedge.com"
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-main text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            className="bg-primary text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
