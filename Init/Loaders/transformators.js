import TransformatorsRegistry from "@Core/Services/Transformators/TransformatorsRegistry"
import SJCL from "@Core/Services/Transformators/Lib/Encryption/SJCL"

TransformatorsRegistry.add(SJCL)
