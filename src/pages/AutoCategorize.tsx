import { Component, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import toast from "solid-toast";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Spinner from "../components/Spinner";
import { AutoCategorizationService } from "../resources/auto-categorization-service";
import { checkAuth } from "../utils/check-auth";
import { handleError } from "../utils/handle-error";

const AutoCategorize: Component = () => {
  checkAuth();

  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [preview, setPreview] = createSignal<
    Array<{
      dishId: string;
      dishName: string;
      currentCategories: string[];
      suggestedCategories: Array<{ id: string; name: string }>;
    }>
  >(null);
  const [stats, setStats] = createSignal<{
    totalDishes: number;
    categorizedDishes: number;
    skippedDishes: number;
    failedDishes: number;
  } | null>(null);

  const loadPreview = async () => {
    setIsProcessing(true);
    try {
      const previewData = await AutoCategorizationService.previewCategorization();
      setPreview(previewData);
      toast.success("Peržiūra įkelta!");
    } catch (error) {
      handleError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const runAutoCategorization = async (overwriteExisting: boolean) => {
    setIsProcessing(true);
    setStats(null);
    try {
      const result = await AutoCategorizationService.autoCategorizeDishes(
        overwriteExisting
      );
      setStats({
        totalDishes: result.totalDishes,
        categorizedDishes: result.categorizedDishes,
        skippedDishes: result.skippedDishes,
        failedDishes: result.failedDishes,
      });
      toast.success(
        `Sėkmingai sukategorizuota ${result.categorizedDishes} patiekalų!`
      );
      // Reload preview to show updated data
      await loadPreview();
    } catch (error) {
      handleError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>Automatinė kategorizacija</Heading>

      <div class="mb-6">
        <p class="mb-4">
          Ši funkcija naudoja dirbtinį intelektą, kad automatiškai priskirtų
          kategorijas patiekalams pagal jų pavadinimus ir aprašymus.
        </p>

        <div class="flex flex-col gap-2 mb-4">
          <Button
            onClick={loadPreview}
            variant="secondary"
            disabled={isProcessing()}
          >
            {isProcessing() ? "Kraunama..." : "Peržiūrėti pasiūlymus"}
          </Button>

          <Button
            onClick={() => runAutoCategorization(false)}
            disabled={isProcessing()}
          >
            {isProcessing()
              ? "Vykdoma..."
              : "Kategorijuoti (tik nesukategorizuotus)"}
          </Button>

          <Button
            onClick={() => runAutoCategorization(true)}
            variant="secondary"
            disabled={isProcessing()}
          >
            {isProcessing()
              ? "Vykdoma..."
              : "Kategorijuoti visus (perrašyti esamus)"}
          </Button>
        </div>

        <Show when={stats()}>
          <div class="bg-violet-50 p-4 rounded-md mb-4">
            <h3 class="font-bold mb-2">Rezultatai:</h3>
            <ul class="list-disc list-inside">
              <li>Viso patiekalų: {stats().totalDishes}</li>
              <li>Sukategorizuota: {stats().categorizedDishes}</li>
              <li>Praleista: {stats().skippedDishes}</li>
              <li>Klaidos: {stats().failedDishes}</li>
            </ul>
          </div>
        </Show>
      </div>

      <Show when={isProcessing() && !preview()}>
        <div class="flex justify-center items-center min-h-48">
          <Spinner />
        </div>
      </Show>

      <Show when={preview()}>
        <div class="mb-4">
          <h3 class="text-lg font-bold mb-3">
            Pasiūlytos kategorijos patiekalams:
          </h3>
          <div class="space-y-2">
            <For each={preview()}>
              {(item) => (
                <div class="bg-white p-4 rounded-md border border-gray-200">
                  <div class="font-semibold mb-2">{item.dishName}</div>
                  <div class="text-sm">
                    <div class="mb-1">
                      <span class="text-gray-600">Dabartinės: </span>
                      {item.currentCategories.length > 0
                        ? item.currentCategories.join(", ")
                        : "Nėra"}
                    </div>
                    <div>
                      <span class="text-gray-600">Pasiūlytos: </span>
                      {item.suggestedCategories.length > 0 ? (
                        <span class="text-violet-600">
                          {item.suggestedCategories
                            .map((c) => c.name)
                            .join(", ")}
                        </span>
                      ) : (
                        <span class="text-gray-400">
                          Nerasta tinkamų kategorijų
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      <div class="mt-6">
        <Button onClick={() => navigate("/")} variant="secondary">
          Atgal į pradžią
        </Button>
      </div>
    </>
  );
};

export default AutoCategorize;
