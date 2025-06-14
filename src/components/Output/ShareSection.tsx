import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface ShareSectionProps {
  sharebuttonText?: string;
}

export const ShareSection: React.FC<ShareSectionProps> = () => {
  const [isCopied, setIsCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText =
    "Check out Holiday Optimizer, an awesome tool to optimize your vacation days!";

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          setIsCopied(true);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          // Optional: Show an error message to the user, e.g., using a toast notification
        });
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 5000); // Revert after 5 seconds
      return () => clearTimeout(timer); // Cleanup timer on component unmount or if isCopied changes
    }
  }, [isCopied]);

  return (
    <Card className="mt-8 shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-theme-9/70" />
          Found this tool helpful?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Help your friends and colleagues optimize their days off by sharing
          Holiday Optimizer with them.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText
            )}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transition-colors"
            aria-label="Share on X/Twitter"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2"
              fill="currentColor"
            >
              <title>X</title>
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
            Share on X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}&quote=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors"
            aria-label="Share on Facebook"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2"
              fill="currentColor"
            >
              <title>Facebook</title>
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
            Share on Facebook
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              shareText + " " + shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-colors"
            aria-label="Share on WhatsApp"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2"
              fill="currentColor"
            >
              <title>WhatsApp</title>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Share on WhatsApp
          </a>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer min-w-[130px] justify-center"
            aria-label="Copy link to clipboard"
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Link Copied!
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareSection;
